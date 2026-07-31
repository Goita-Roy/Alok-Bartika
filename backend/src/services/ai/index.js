// AI provider factory + orchestration.
//
// Mirrors the SMS provider pattern (see services/smsService.js):
//   - The rest of the app depends only on the `complete()` interface.
//   - Concrete providers are selected via the AI_PROVIDER env var and lazily
//     required, so no provider SDK is hard-coupled into the codebase.
//   - If the primary provider fails with a retryable error (network, timeout,
//     rate limit, 5xx), the next configured provider is tried automatically.
//   - If no provider has a usable API key, a friendly 503 "not configured"
//     error is thrown instead of crashing the request.

const { env } = require('../../config/env')
const { AIApiError, isRetryableError } = require('./errors')

const FALLBACK_ORDER = ['groq', 'gemini', 'openrouter', 'openai']

function providerKey(name) {
  switch (name) {
    case 'groq':
      return env.groqApiKey
    case 'gemini':
      return env.geminiApiKey
    case 'openrouter':
      return env.openrouterApiKey
    case 'openai':
      return env.openaiApiKey
    default:
      return ''
  }
}

const PROVIDER_FILES = {
  groq: 'GroqProvider',
  gemini: 'GeminiProvider',
  openrouter: 'OpenRouterProvider',
  openai: 'OpenAIProvider',
}

function loadProvider(name) {
  const fileName = PROVIDER_FILES[name] || name
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const mod = require(`./providers/${fileName}`)
  const factory = mod.createAIProvider || mod.default
  if (typeof factory !== 'function') {
    throw new Error(`AI provider "${name}" does not export createAIProvider`)
  }
  return factory
}

function buildProvider(name) {
  try {
    const factory = loadProvider(name)
    return factory({ apiKey: providerKey(name), timeoutMs: env.aiTimeoutMs })
  } catch (err) {
    console.error(`[ai] failed to load provider "${name}": ${err.message}`)
    return null
  }
}

// Providers in priority order (configured primary first) that actually have a key.
function getConfiguredProviders() {
  const primary = (env.aiProvider || 'groq').toLowerCase().trim()
  const order = [primary, ...FALLBACK_ORDER.filter((n) => n !== primary)]

  const providers = []
  for (const name of order) {
    const provider = buildProvider(name)
    if (provider && provider.isConfigured()) providers.push(provider)
  }
  return providers
}

function getPrimaryName() {
  return (env.aiProvider || 'groq').toLowerCase().trim()
}

/**
 * Generate a completion, transparently falling back to the next configured
 * provider when the primary fails with a retryable error.
 *
 * @param {object} opts
 * @param {string} opts.system       System prompt.
 * @param {Array<{role: 'user'|'assistant', content: string}>} opts.messages  Conversation turns.
 * @param {number} [opts.maxTokens]
 * @param {number} [opts.temperature]
 * @returns {Promise<string>} generated text
 * @throws {AIApiError}
 */
async function complete({ system, messages, maxTokens, temperature }) {
  const providers = getConfiguredProviders()

  if (!providers.length) {
    throw new AIApiError(
      'AI Buddy is not configured yet. Please ask your administrator to set AI_PROVIDER and the matching API key.',
      'not_configured',
      503,
    )
  }

  let lastError = null
  for (const provider of providers) {
    try {
      return await provider.complete({ system, messages, maxTokens, temperature })
    } catch (err) {
      lastError = err
      if (!isRetryableError(err)) {
        // Config/content problems won't be fixed by another provider — fail fast.
        throw err
      }
      console.error(`[ai] provider "${provider.name}" failed (${err.kind}): ${err.message}; trying next provider`)
    }
  }

  throw lastError || new AIApiError('The AI service is unavailable. Please try again.', 'provider_unavailable', 502)
}

module.exports = { complete, getConfiguredProviders, getPrimaryName, providerKey }
