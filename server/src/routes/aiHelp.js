const express = require('express')
const OpenAI = require('openai')
const { authRequired, requireRole } = require('../middleware/auth')
const { optionalEnv } = require('../config/env')
const { mongoIsReady } = require('../config/db')
const { HintLog } = require('../models/HintLog')
const { asTrimmedString, cleanMultilineText } = require('../utils/requestValidation')

const memoryHintLogs = []
const MODEL_NAME = 'gpt-4.1-mini'

function trimText(value, maxLen) {
  return asTrimmedString(value, maxLen)
}

function buildFallbackResponse(errorOutput) {
  const shortError = trimText(errorOutput, 350) || 'No error text was provided.'
  return {
    explanation:
      `Your code ran into this error: "${shortError}". This usually means Python could not understand one part of the program.`,
    suggestedFix:
      'Read the error line carefully, then check spelling, missing colons, and indentation. Fix one small issue and run again.',
    beginnerGuidance:
      'You are learning, so mistakes are normal. Try tiny steps: run often, fix one error at a time, and celebrate each green run.',
    model: 'fallback',
  }
}

function buildAiHelpRouter({ jwtSecret }) {
  const router = express.Router()
  const openAiApiKey = optionalEnv('OPENAI_API_KEY', '')
  const openai = openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null

  router.post(
    '/ai/help',
    authRequired(jwtSecret),
    requireRole('student'),
    async (req, res) => {
      const startedAt = Date.now()
      const sourceCode = cleanMultilineText(req.body?.sourceCode, 15000)
      const errorOutput = cleanMultilineText(req.body?.errorOutput, 8000)
      const lessonId = trimText(req.body?.lessonId, 200)

      if (!sourceCode.trim()) return res.status(400).json({ error: 'sourceCode is required' })
      if (!errorOutput.trim()) return res.status(400).json({ error: 'errorOutput is required' })

      let aiResult = null
      try {
        if (!openai) throw new Error('OPENAI_API_KEY missing')

        const completion = await openai.chat.completions.create({
          model: MODEL_NAME,
          temperature: 0.2,
          max_tokens: 350,
          messages: [
            {
              role: 'system',
              content:
                'You are a friendly coding tutor for kids. Return valid JSON only with keys: explanation, suggestedFix, beginnerGuidance. Keep each value clear, kind, and short (2-4 sentences).',
            },
            {
              role: 'user',
              content: JSON.stringify({
                task: 'Explain coding error and suggest next fix',
                sourceCode,
                errorOutput,
                audience: 'beginner kids',
              }),
            },
          ],
          response_format: { type: 'json_object' },
        })

        const payload = completion.choices?.[0]?.message?.content ?? '{}'
        const parsed = JSON.parse(payload)
        aiResult = {
          explanation: trimText(parsed?.explanation, 900),
          suggestedFix: trimText(parsed?.suggestedFix, 900),
          beginnerGuidance: trimText(parsed?.beginnerGuidance, 900),
          model: completion.model || MODEL_NAME,
        }

        if (!aiResult.explanation || !aiResult.suggestedFix || !aiResult.beginnerGuidance) {
          throw new Error('Model response missing required fields')
        }
      } catch (err) {
        aiResult = buildFallbackResponse(errorOutput)
      }

      const latencyMs = Date.now() - startedAt
      const logEntry = {
        userId: String(req.user?.sub ?? ''),
        lessonId,
        sourceCode,
        errorOutput,
        explanation: aiResult.explanation,
        suggestedFix: aiResult.suggestedFix,
        beginnerGuidance: aiResult.beginnerGuidance,
        model: aiResult.model,
        latencyMs,
      }

      try {
        if (mongoIsReady()) {
          await HintLog.create(logEntry)
        } else {
          memoryHintLogs.push({ ...logEntry, createdAt: new Date().toISOString() })
          if (memoryHintLogs.length > 300) memoryHintLogs.shift()
        }
      } catch (err) {
        // Logging failure should not block student help.
      }

      return res.json({
        ok: true,
        explanation: aiResult.explanation,
        suggestedFix: aiResult.suggestedFix,
        beginnerGuidance: aiResult.beginnerGuidance,
        model: aiResult.model,
        latencyMs,
      })
    },
  )

  return router
}

module.exports = { buildAiHelpRouter }
