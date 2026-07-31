// Groq provider — OpenAI-compatible chat completions API.
// Recommended Phase-1 default: fast, generous free tier, no credit card
// required, and an identical request/response shape to OpenAI (so switching
// to a paid OpenAI/other provider later is a config + tiny provider change).
// Endpoint: POST https://api.groq.com/openai/v1/chat/completions

const { AIProvider } = require('../AIProvider')

class GroqProvider extends AIProvider {
  constructor(config = {}) {
    super(config)
    this.name = 'groq'
    this.model = config.model || 'llama-3.3-70b-versatile'
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions'
  }

  async complete({ system, messages, maxTokens, temperature }) {
    const payload = {
      model: this.model,
      messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
      max_tokens: maxTokens || 300,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
    }

    const res = await this._fetchWithTimeout(this.apiUrl, {
      method: 'POST',
      headers: this._openAIHeaders(),
      body: JSON.stringify(payload),
    })

    const data = await this._handleResponse(res)
    return this._extractChatContent(data)
  }
}

function createAIProvider(config) {
  return new GroqProvider(config)
}

module.exports = { GroqProvider, createAIProvider }
