const mongoose = require('mongoose')

const contactSettingsSchema = new mongoose.Schema({
  email: { type: String, default: 'hello@alokbartika.com' },
  phone: { type: String, default: '+৮৮০ ১৭১২-৩৪৫৬৭৮' },
  address: { type: String, default: 'মিরপুর-১০, ঢাকা, বাংলাদেশ' },
  facebook: { type: String, default: '' },
  youtube: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  mapLink: { type: String, default: '' },
  liveChatEnabled: { type: Boolean, default: false },
}, { timestamps: true })

const ContactSettings = mongoose.model('ContactSettings', contactSettingsSchema)

module.exports = { ContactSettings }
