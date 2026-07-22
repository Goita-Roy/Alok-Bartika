// SMS provider abstraction.
//
// The app depends only on the `sendSms({ to, message })` interface defined
// here. Concrete providers (SSL Wireless, Twilio, GreenWeb, BulkSMSBD, ...)
// are selected via the SMS_PROVIDER env var and lazily required, so no
// provider SDK is hard-coupled into the codebase. If no provider is
// configured (or in development/test), a safe no-op provider is used that
// logs the message instead of failing the request.

const { env } = require('../config/env')

// --- No-op / console provider (default when none configured) ---
function createNoopProvider() {
  return {
    name: 'noop',
    async sendSms({ to, message }) {
      console.log(`[sms:noop] would send to ${to}: ${message}`)
      return { provider: 'noop', sent: true, simulated: true }
    },
  }
}

// --- Provider factory ---
// Each provider module is expected to export `createSmsProvider(config)`.
// Add new providers here without touching call sites.
function loadProvider() {
  const name = (env.smsProvider || '').toLowerCase()

  if (!name || name === 'noop' || name === 'console') {
    return createNoopProvider()
  }

  try {
    // Providers live under services/sms/providers/<name>.js
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const mod = require(`./providers/${name}`)
    const factory = mod.createSmsProvider || mod.default || mod
    return factory({
      apiKey: env.smsApiKey,
      apiSecret: env.smsApiSecret,
      senderId: env.smsSenderId,
      baseUrl: env.smsBaseUrl,
    })
  } catch (err) {
    console.error(`[sms] failed to load provider "${name}": ${err.message}. Falling back to noop.`)
    return createNoopProvider()
  }
}

let provider = null
function getProvider() {
  if (!provider) provider = loadProvider()
  return provider
}

/**
 * Send an SMS. Never throws for missing configuration — falls back to no-op
 * so verification flows are not blocked in environments without an SMS gateway.
 * @param {{ to: string, message: string }} params
 */
async function sendSms({ to, message }) {
  const p = getProvider()
  return p.sendSms({ to, message })
}

module.exports = { sendSms, getProvider }
