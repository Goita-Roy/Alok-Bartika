// OpenAI provider — OpenAI-compatible chat completions API.
// Primary target for the future paid phase: switching AI_PROVIDER=openai and
// setting OPENAI_API_KEY is all that is required — no code or API changes.
// Endpoint: POST https://api.openai.com/v1/chat/completions

const { AIProvider } = require('../AIProvider')

class OpenAIProvider extends AIProvider {
  constructor(config = {}) {
    super(config)
    this.name = 'openai'
    this.model = config.model || 'gpt-4o-mini'
    this.apiUrl = 'https://api.openai.com/v1/chat/completions'
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
  return new OpenAIProvider(config)
}

module.exports = { OpenAIProvider, createAIProvider }
