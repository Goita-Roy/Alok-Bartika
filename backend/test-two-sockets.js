const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const io = require('socket.io-client');
const { spawn } = require('child_process');
const dns = require('dns');

const JWT_SECRET = 'alokbartika_jwt_secret_key_2026';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function runTest() {
  console.log('[TEST] === TWO ADMIN SOCKETS SIMULATION ===\n');

  await mongoose.connect('mongodb+srv://goita0001_db_user:alokbartika1454@cluster0.5pgxidv.mongodb.net/alokbartika?retryWrites=true&w=majority&appName=Cluster0', {
    serverSelectionTimeoutMS: 10000, family: 4,
  });

  const User = mongoose.model('User', new mongoose.Schema({
    fullName: String, email: String, role: String, password: String, isActive: Boolean,
  }, { collection: 'users' }));

  const SupportConversation = mongoose.model('SupportConversation', new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String, unreadStudent: Number, unreadAdmin: Number,
  }, { collection: 'supportconversations' }));

  const student = await User.findOne({ role: 'student' });
  const admin = await User.findOne({ role: 'admin' });

  let conv = await SupportConversation.findOne({ student: student._id }).sort({ updatedAt: -1 }).lean();
  console.log('[MONGO] Initial:', { convId: conv._id.toString(), unreadAdmin: conv.unreadAdmin });

  // Reset
  await SupportConversation.findByIdAndUpdate(conv._id, { unreadAdmin: 0, unreadStudent: 0 });
  const convId = conv._id.toString();
  const studentToken = jwt.sign({ id: student._id, userId: student._id, email: student.email, role: student.role }, JWT_SECRET, { expiresIn: '30d' });
  const adminToken = jwt.sign({ id: admin._id, userId: admin._id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '30d' });

  await mongoose.disconnect();

  const fullPath = process.execPath;
  const server = spawn(fullPath, ['src/server.js'], { cwd: process.cwd(), stdio: 'pipe' });
  let serverReady = false;

  server.stdout.on('data', (data) => {
    if (data.toString().includes('running on') && !serverReady) {
      serverReady = true;
      console.log('[SERVER] Ready\n');
      startTest();
    }
    process.stdout.write('[SERVER] ' + data);
  });
  server.stderr.on('data', (data) => console.log('[SERVER STDERR]', data.toString().trim()));

  function startTest() {
    const convListState = { unreadAdmin: 999 }; // Simulate SupportConversationList local state
    const chatWindowState = { unreadAdmin: 999 }; // Simulate SupportChatWindow local state

    console.log('--- Phase 1: Two admin sockets connect (simulating SupportConversationList + SupportChatWindow) ---');

    // Socket 1: SupportConversationList socket
    const socketList = io('http://localhost:5000', { auth: { token: adminToken }, transports: ['websocket', 'polling'] });

    socketList.on('connect', () => {
      console.log('[SOCKET-LIST] Connected:', socketList.id);
      socketList.emit('join_room', {});
    });

    socketList.on('message_seen', (payload) => {
      console.log('[SOCKET-LIST] message_seen received:');
      console.log('  conversationId:', payload.conversationId);
      console.log('  seenByRole:', payload.seenByRole);
      console.log('  unreadAdmin:', payload.unreadAdmin);
      console.log('  unreadStudent:', payload.unreadStudent);
      // Simulate setConversations in SupportConversationList
      convListState.unreadAdmin = payload.unreadAdmin ?? 0;
      console.log('[SOCKET-LIST] SupportConversationList state unreadAdmin =', convListState.unreadAdmin);
    });

    socketList.on('receive_message', (payload) => {
      // Simulate setConversations in SupportConversationList
      convListState.unreadAdmin = payload.unreadAdmin ?? (convListState.unreadAdmin || 0) + 1;
      console.log('[SOCKET-LIST] receive_message — SupportConversationList state unreadAdmin =', convListState.unreadAdmin);
    });

    // Socket 2: SupportChatWindow socket (created when conversation opens)
    setTimeout(() => {
      console.log('\n--- Phase 2: Admin opens conversation (SupportChatWindow socket created) ---');
      const socketChat = io('http://localhost:5000', { auth: { token: adminToken }, transports: ['websocket', 'polling'] });

      socketChat.on('connect', () => {
        console.log('[SOCKET-CHAT] Connected:', socketChat.id);
        socketChat.emit('join_room', {});

        // Simulate SupportChatWindow's useEffect emitting message_seen after socket connects
        setTimeout(() => {
          console.log('[SOCKET-CHAT] Emitting message_seen');
          socketChat.emit('message_seen', { conversationId: convId });
          console.log('[SOCKET-CHAT] message_seen emitted\n');
        }, 500);
      });

      socketChat.on('message_seen', (payload) => {
        console.log('[SOCKET-CHAT] message_seen received:');
        console.log('  conversationId:', payload.conversationId);
        console.log('  seenByRole:', payload.seenByRole);
        console.log('  unreadAdmin:', payload.unreadAdmin);
      });
    }, 1000);

    // Student sends message
    setTimeout(() => {
      console.log('\n--- Phase 3: Student sends message ---');
      const studentSocket = io('http://localhost:5000', { auth: { token: studentToken }, transports: ['websocket', 'polling'] });

      studentSocket.on('connect', () => {
        console.log('[STUDENT] Connected:', studentSocket.id);
        studentSocket.emit('join_room', {});
        studentSocket.emit('send_message', { message: 'Test message', conversationId: convId, clientMessageId: 'unread-test-1' });
      });

      studentSocket.on('message_sent', (payload) => {
        console.log('[STUDENT] message_sent — unreadAdmin:', payload.unreadAdmin);
      });
    }, 2000);

    // Final check
    setTimeout(async () => {
      console.log('\n=== FINAL STATE ===');
      console.log('[SOCKET-LIST] SupportConversationList unreadAdmin:', convListState.unreadAdmin);

      await mongoose.connect('mongodb+srv://goita0001_db_user:alokbartika1454@cluster0.5pgxidv.mongodb.net/alokbartika?retryWrites=true&w=majority&appName=Cluster0', {
        serverSelectionTimeoutMS: 10000, family: 4,
      });
      const final = await SupportConversation.findById(convId).lean();
      console.log('[DB] Final unreadAdmin:', final.unreadAdmin);
      mongoose.disconnect();

      if (convListState.unreadAdmin === 0) {
        console.log('[RESULT] ✓ Badge should DISAPPEAR (unreadAdmin = 0)');
      } else {
        console.log('[RESULT] ✗ Badge STILL SHOWS (unreadAdmin =', convListState.unreadAdmin, ')');
      }

      process.exit(0);
    }, 6000);
  }
}

runTest().catch(err => console.log('[ERROR]', err.message));
