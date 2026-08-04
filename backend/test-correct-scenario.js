const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const io = require('socket.io-client');
const { spawn } = require('child_process');
const dns = require('dns');

const JWT_SECRET = 'alokbartika_jwt_secret_key_2026';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function runTest() {
  console.log('[TEST] === CORRECT USER SCENARIO: Student sends, then admin reads ===\n');

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
    const convListState = { unreadAdmin: 999, convId: null };
    const eventLog = [];

    // Socket 1: SupportConversationList socket (always connected)
    const socketList = io('http://localhost:5000', { auth: { token: adminToken }, transports: ['websocket', 'polling'] });

    socketList.on('connect', () => {
      console.log('[SOCKET-LIST] Connected:', socketList.id);
      socketList.emit('join_room', {});
    });

    socketList.on('receive_message', (payload) => {
      eventLog.push({ type: 'receive_message', ts: Date.now(), payload });
      // EXACT simulation of SupportConversationList setConversations
      setConvListState(prev => {
        if (prev.convId !== payload.conversationId) return prev;
        const newUnread = payload.unreadAdmin ?? (prev.unreadAdmin || 0) + 1;
        console.log('[SOCKET-LIST] setConversations (receive_message): unreadAdmin', prev.unreadAdmin, '->', newUnread, '(payload.unreadAdmin:', payload.unreadAdmin, ')');
        return { ...prev, unreadAdmin: newUnread };
      });
    });

    socketList.on('message_seen', (payload) => {
      eventLog.push({ type: 'message_seen', ts: Date.now(), payload });
      setConvListState(prev => {
        const newUnread = payload.unreadAdmin ?? 0;
        console.log('[SOCKET-LIST] setConversations (message_seen): unreadAdmin', prev.unreadAdmin, '->', newUnread, '(payload.unreadAdmin:', payload.unreadAdmin, ')');
        return { ...prev, unreadAdmin: newUnread };
      });
    });

    // Socket 2: SupportChatWindow socket (created when conversation opens)
    let socketChat = null;

    // Phase 1: Student connects and sends message
    setTimeout(() => {
      console.log('\n--- Phase 1: Student connects and sends message ---');
      const studentSocket = io('http://localhost:5000', { auth: { token: studentToken }, transports: ['websocket', 'polling'] });

      studentSocket.on('connect', () => {
        console.log('[STUDENT] Connected:', studentSocket.id);
        studentSocket.emit('join_room', {});
        studentSocket.emit('send_message', {
          message: 'Test unread message',
          conversationId: convId,
          clientMessageId: 'test-msg-1'
        });
        console.log('[STUDENT] send_message emitted');
      });

      studentSocket.on('message_sent', (payload) => {
        console.log('[STUDENT] message_sent — unreadAdmin:', payload.unreadAdmin);
        // Set the convListState's convId so receive_message can find it
        setConvListState(prev => ({ ...prev, convId: convId }));
      });

      studentSocket.on('connect_error', (err) => {
        console.log('[STUDENT] Connect error:', err.message);
      });
    }, 1000);

    // Phase 2: Admin opens conversation (1s after student message)
    setTimeout(() => {
      console.log('\n--- Phase 2: Admin opens conversation ---');
      socketChat = io('http://localhost:5000', { auth: { token: adminToken }, transports: ['websocket', 'polling'] });

      socketChat.on('connect', () => {
        console.log('[SOCKET-CHAT] Connected:', socketChat.id);
        socketChat.emit('join_room', {});

        setTimeout(() => {
          console.log('[SOCKET-CHAT] Emitting message_seen');
          socketChat.emit('message_seen', { conversationId: convId });
        }, 500);
      });

      socketChat.on('message_seen', (payload) => {
        console.log('[SOCKET-CHAT] message_seen received — unreadAdmin:', payload.unreadAdmin);
      });
    }, 2000);

    // Phase 3: Final check
    setTimeout(async () => {
      console.log('\n=== FINAL RESULTS ===');
      console.log('[SOCKET-LIST] Final unreadAdmin:', convListState.unreadAdmin);

      await mongoose.connect('mongodb+srv://goita0001_db_user:alokbartika1454@cluster0.5pgxidv.mongodb.net/alokbartika?retryWrites=true&w=majority&appName=Cluster0', {
        serverSelectionTimeoutMS: 10000, family: 4,
      });
      const final = await SupportConversation.findById(convId).lean();
      console.log('[DB] Final unreadAdmin:', final.unreadAdmin);
      mongoose.disconnect();

      console.log('\n=== EVENT LOG (ordered by timestamp) ===');
      eventLog
        .sort((a, b) => a.ts - b.ts)
        .forEach(e => {
          console.log(`  ${e.type}: unreadAdmin=${e.payload.unreadAdmin}, seenByRole=${e.payload.seenByRole || 'N/A'}`);
        });

      if (convListState.unreadAdmin === 0) {
        console.log('\n[RESULT] ✓ Badge DISAPPEARED (unreadAdmin = 0)');
      } else {
        console.log('\n[RESULT] ✗ Badge STILL SHOWS (unreadAdmin =', convListState.unreadAdmin, ')');
      }

      process.exit(0);
    }, 5000);
  }

  function setConvListState(updater) {
    const prev = convListState;
    const next = updater(prev);
    Object.assign(convListState, next);
  }
}

runTest().catch(err => console.log('[ERROR]', err.message));
