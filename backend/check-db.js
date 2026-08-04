const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.connect('mongodb+srv://goita0001_db_user:alokbartika1454@cluster0.5pgxidv.mongodb.net/alokbartika?retryWrites=true&w=majority&appName=Cluster0', {
  serverSelectionTimeoutMS: 10000,
  family: 4,
}).then(async () => {
  const SupportConversation = mongoose.model('SupportConversation', new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
    unreadStudent: Number,
    unreadAdmin: Number,
  }, { collection: 'supportconversations' }));

  // Find conversations where unreadAdmin is 0 or missing
  const zeroOrMissing = await SupportConversation.find({
    $or: [
      { unreadAdmin: { $exists: false } },
      { unreadAdmin: { $exists: true, $eq: 0 } },
    ]
  }).limit(10).lean();
  console.log('Conversations with unreadAdmin = 0 or missing:', zeroOrMissing.length);
  zeroOrMissing.forEach(c => {
    console.log({
      id: c._id.toString(),
      unreadStudent: c.unreadStudent,
      unreadAdmin: c.unreadAdmin,
      hasUnreadAdmin: 'unreadAdmin' in c,
    });
  });

  // Find conversations where unreadAdmin > 0
  const nonZero = await SupportConversation.find({ unreadAdmin: { $gt: 0 } }).limit(10).lean();
  console.log('\nConversations with unreadAdmin > 0:', nonZero.length);
  nonZero.forEach(c => {
    console.log({
      id: c._id.toString(),
      unreadStudent: c.unreadStudent,
      unreadAdmin: c.unreadAdmin,
      hasUnreadAdmin: 'unreadAdmin' in c,
    });
  });

  mongoose.disconnect();
}).catch(err => console.log('Error:', err.message));
