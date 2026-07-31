// OpenRouter provider — OpenAI-compatible chat completions API with access to
// many models, including free `:free` models. Optional third provider for
// additional coverage/fallback.
// Endpoint: POST https://openrouter.ai/api/v1/chat/completions

const { AIProvider } = require('../AIProvider')

class OpenRouterProvider extends AIProvider {
  constructor(config = {}) {
    super(config)
    this.name = 'openrouter'
    this.model = config.model || 'google/gemma-3-27b-it:free'
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions'
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
      headers: {
        ...this._openAIHeaders(),
        'HTTP-Referer': 'https://alokbartika.vercel.app',
        'X-Title': 'Alokbartika AI Buddy',
      },
      body: JSON.stringify(payload),
    })

    const data = await this._handleResponse(res)
    return this._extractChatContent(data)
  }
}

function createAIProvider(config) {
  return new OpenRouterProvider(config)
}

module.exports = { OpenRouterProvider, createAIProvider }
