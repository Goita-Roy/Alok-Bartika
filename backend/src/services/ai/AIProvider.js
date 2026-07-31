// Base class for all AI providers.
//
// A concrete provider only needs to:
//   1. Set this.name / this.apiUrl / this.model in its constructor.
//   2. Implement complete({ system, messages, maxTokens, temperature }) and
//      return the generated text.
//
// The base class provides shared, hardened plumbing:
//   - isConfigured()        — whether an API key is present
//   - _fetchWithTimeout()   — fetch guarded by an AbortController timeout
//   - _handleResponse()     — HTTP status → normalized AIApiError mapping
//   - _openAIHeaders()      — Authorization header for OpenAI-compatible APIs
//   - _extractChatContent() — pull the message text out of a chat/completions response
//
// Providers never throw raw fetch/network errors — only AIApiError.

const { AIApiError } = require('./errors')

class AIProvider {
  /**
   * @param {{ apiKey?: string, timeoutMs?: number, model?: string }} [config]
   */
  constructor(config = {}) {
    this.apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : ''
    this.timeoutMs = Number(config.timeoutMs) > 0 ? Number(config.timeoutMs) : 30000
    this.model = config.model || ''
    this.name = 'base'
    this.apiUrl = ''
  }

  isConfigured() {
    return Boolean(this.apiKey)
  }

  /**
   * Generate a completion. Implement in subclasses.
   * @param {{ system: string, messages: Array<{role: 'user'|'assistant', content: string}>, maxTokens: number, temperature: number }} _options
   * @returns {Promise<string>}
   */
  async complete(_options) {
    throw new AIApiError('AI provider does not implement complete()', 'provider_unavailable', 502)
  }

  /**
   * fetch() with an AbortController timeout. Never throws raw errors.
   * @returns {Promise<Response>}
   */
  async _fetchWithTimeout(url, init) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      return await fetch(url, { ...init, signal: controller.signal })
    } catch (err) {
      if (err && err.name === 'AbortError') {
        throw new AIApiError('The AI service took too long to respond. Please try again.', 'timeout', 504)
      }
      throw new AIApiError('Could not reach the AI service. Please check your connection and try again.', 'network', 502)
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Map an HTTP response to JSON or a normalized AIApiError.
   * @param {Response} res
   * @returns {Promise<any>}
   */
  async _handleResponse(res) {
    let data = null
    try {
      data = await res.json()
    } catch (_err) {
      // Some providers return empty bodies on errors; fall through to status mapping.
    }

    if (res.ok) return data

    if (res.status === 401 || res.status === 403) {
      throw new AIApiError('AI service authentication failed. Please contact support.', 'invalid_key', 502)
    }
    if (res.status === 429) {
      throw new AIApiError('The AI service is busy right now. Please wait a moment and try again.', 'rate_limited', 429)
    }
    if (res.status >= 500) {
      throw new AIApiError('The AI service is temporarily unavailable. Please try again.', 'provider_unavailable', 502)
    }

    throw new AIApiError('The AI service rejected the request.', 'bad_request', 400)
  }

  _openAIHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Extract the generated text from an OpenAI-compatible chat/completions body.
   * @param {any} data
   * @returns {string}
   */
  _extractChatContent(data) {
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
    if (typeof content !== 'string' || !content.trim()) {
      throw new AIApiError('The AI service returned an empty response. Please try again.', 'empty_response', 502)
    }
    return content.trim()
  }
}

module.exports = { AIProvider }
