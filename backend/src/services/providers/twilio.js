// Example SMS provider template. Not used unless SMS_PROVIDER=twilio.
// Implement `sendSms` against your provider's SDK. Keep credentials from env.
//
// module.exports = {
//   createSmsProvider({ apiKey, apiSecret, senderId, baseUrl }) {
//     return {
//       name: 'twilio',
//       async sendSms({ to, message }) {
//         // const client = require('twilio')(apiKey, apiSecret)
//         // await client.messages.create({ to, from: senderId, body: message })
//         return { provider: 'twilio', sent: true }
//       },
//     }
//   },
// }
module.exports = {}
