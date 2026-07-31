// Gemini provider — Google Generative Language REST API (v1beta).
// Uses systemInstruction for the system prompt and maps OpenAI-style
// conversation roles to contents/parts. Secondary fallback provider.
// Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent

const { AIProvider } = require('../AIProvider')
const { AIApiError } = require('../errors')

class GeminiProvider extends AIProvider {
  constructor(config = {}) {
    super(config)
    this.name = 'gemini'
    this.model = config.model || 'gemini-2.0-flash'
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`
  }

  async complete({ system, messages, maxTokens, temperature }) {
    const contents = []
    for (const m of messages) {
      const role = m.role === 'assistant' ? 'model' : 'user'
      contents.push({ role, parts: [{ text: m.content }] })
    }

    const payload = {
      contents,
      generationConfig: {
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        maxOutputTokens: maxTokens || 300,
      },
    }
    if (system) {
      payload.systemInstruction = { parts: [{ text: system }] }
    }

    const res = await this._fetchWithTimeout(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify(payload),
    })

    const data = await this._handleResponse(res)

    const text =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
        ? data.candidates[0].content.parts.map((p) => (p && p.text) || '').join('')
        : ''

    if (!text.trim()) {
      throw new AIApiError('The AI service returned an empty response. Please try again.', 'empty_response', 502)
    }
    return text.trim()
  }
}

function createAIProvider(config) {
  return new GeminiProvider(config)
}

module.exports = { GeminiProvider, createAIProvider }
