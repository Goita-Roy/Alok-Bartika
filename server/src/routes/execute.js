const express = require('express')
const axios = require('axios')
const { authRequired, requireRole } = require('../middleware/auth')
const { optionalEnv } = require('../config/env')
const { cleanMultilineText } = require('../utils/requestValidation')

const PYTHON_LANGUAGE_ID = 71 // Judge0: Python (3.x)

function buildExecuteRouter({ jwtSecret }) {
  const router = express.Router()

  router.post(
    '/execute/python',
    authRequired(jwtSecret),
    requireRole('student'),
    async (req, res) => {
      const sourceCode = cleanMultilineText(req.body?.sourceCode, 20000)
      const stdin = cleanMultilineText(req.body?.stdin ?? '', 4000)

      if (!sourceCode.trim()) {
        return res.status(400).json({ error: 'sourceCode is required' })
      }

      const maxChars = Number(optionalEnv('JUDGE0_MAX_SOURCE_CHARS', '20000'))
      if (sourceCode.length > maxChars) {
        return res.status(413).json({ error: `sourceCode too large (max ${maxChars} chars)` })
      }

      const baseUrl = optionalEnv('JUDGE0_BASE_URL', 'https://ce.judge0.com')
      const authToken = optionalEnv('JUDGE0_AUTH_TOKEN', '')
      const timeoutMs = Number(optionalEnv('JUDGE0_TIMEOUT_MS', '15000'))

      try {
        const url = `${String(baseUrl).replace(/\/$/, '')}/submissions?wait=true`
        const r = await axios.post(
          url,
          {
            language_id: PYTHON_LANGUAGE_ID,
            source_code: sourceCode,
            stdin: typeof stdin === 'string' ? stdin : String(stdin ?? ''),
          },
          {
            timeout: timeoutMs,
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'X-Auth-Token': authToken } : {}),
            },
            // Avoid leaking upstream HTML in errors
            validateStatus: () => true,
          },
        )

        if (r.status >= 400) {
          return res.status(502).json({
            error: 'Judge0 request failed',
            upstreamStatus: r.status,
            upstream: typeof r.data === 'object' ? r.data : undefined,
          })
        }

        const data = r.data ?? {}
        return res.json({
          ok: true,
          stdout: data.stdout ?? '',
          stderr: data.stderr ?? '',
          compile_output: data.compile_output ?? '',
          message: data.message ?? '',
          time: data.time ?? null,
          memory: data.memory ?? null,
          status: data.status ?? null,
        })
      } catch (err) {
        return res.status(502).json({ error: 'Execution service unavailable' })
      }
    },
  )

  return router
}

module.exports = { buildExecuteRouter }

