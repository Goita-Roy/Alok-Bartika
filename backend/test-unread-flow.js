const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const io = require('socket.io-client');
const { spawn } = require('child_process');
const dns = require('dns');

const JWT_SECRET = 'alokbartika_jwt_secret_key_2026';

dns.setServers(['8.8.8.8', '1.1.1.1']);

// Test: Student sends message → Admin receives → Admin marks as read → Badge should disappear
async function runTest() {
  console.log('[TEST] === COMPLETE UNREAD FLOW TEST ===\n');

  // Connect to Atlas to get real users
  await mongoose.connect('mongodb+srv://goita0001_db_user:alokbartika1454@cluster0.5pgxidv.mongodb.net/alokbartika?retryWrites=true&w=majority&appName=Cluster0', {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  });
  console.log('[MONGODB] Connected to Atlas');

  const User = mongoose.model('User', new mongoose.Schema({
    fullName: String, email: String, role: String, password: String,
    isActive: Boolean,
  }, { collection: 'users' }));

  // Find a student and get their active conversation
  const student = await User.findOne({ role: 'student' });
  const admin = await User.findOne({ role: 'admin' });

  console.log('[MONGODB] Student:', { id: student._id.toString(), email: student.email });
  console.log('[MONGODB] Admin:', { id: admin._id.toString(), email: admin.email });

  // Find the conversation for this student
  const SupportConversation = mongoose.model('SupportConversation', new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
    unreadStudent: Number,
    unreadAdmin: Number,
    lastMessage: String,
    lastMessageAt: Date,
  }, { collection: 'supportconversations' }));

  let conv = await SupportConversation.findOne({ student: student._id }).sort({ updatedAt: -1 }).lean();
  console.log('[MONGODB] Initial conversation state:', {
    convId: conv?._id?.toString(),
    unreadStudent: conv?.unreadStudent,
    unreadAdmin: conv?.unreadAdmin,
  });

  // Create JWTs
  const studentToken = jwt.sign(
    { id: student._id, userId: student._id, email: student.email, role: student.role },
    JWT_SECRET, { expiresIn: '30d' }
  );
  const adminToken = jwt.sign(
    { id: admin._id, userId: admin._id, email: admin.email, role: admin.role },
    JWT_SECRET, { expiresIn: '30d' }
  );

  await mongoose.disconnect();

  // Start backend server
  console.log('\n[SERVER] Starting...');
  const fullPath = process.execPath;
  const server = spawn(fullPath, ['src/server.js'], {
    cwd: process.cwd(),
    stdio: 'pipe',
  });

  let serverReady = false;
  let testPhase = 0;
  let studentSocket = null;
  let adminSocket = null;
  let convId = conv?._id?.toString();

  server.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write('[SERVER] ' + output);
    if (output.includes('running on') && !serverReady) {
      serverReady = true;
      setTimeout(() => startTest(), 3000);
    }
  });

  server.stderr.on('data', (data) => {
    console.log('[SERVER STDERR]', data.toString().trim());
  });

  function startTest() {
    console.log('\n[TEST] Starting full flow test\n');

    // Connect student socket
    studentSocket = io('http://localhost:5000', {
      auth: { token: studentToken },
      transports: ['websocket', 'polling'],
    });

    studentSocket.on('connect', () => {
      console.log('[STUDENT SOCKET] Connected:', studentSocket.id);
      studentSocket.emit('join_room', {});

      // Send a message (this should increment unreadAdmin on backend)
      setTimeout(() => {
        console.log('[STUDENT] Emitting send_message');
        studentSocket.emit('send_message', {
          message: 'Test message for unread badge',
          conversationId: convId,
          clientMessageId: 'test-unread-1'
        });
      }, 1000);

      // Then connect admin socket after student message is sent
      setTimeout(() => {
        console.log('[STUDENT] Waiting for admin to connect...');
      }, 4000);
    });

    studentSocket.on('message_sent', (payload) => {
      console.log('[STUDENT] Received message_sent:', JSON.stringify({
        conversationId: payload.conversationId,
        unreadStudent: payload.unreadStudent,
        unreadAdmin: payload.unreadAdmin,
      }));
    });

    studentSocket.on('error', (err) => {
      console.log('[STUDENT] Socket error:', JSON.stringify({ code: err?.code, message: err?.message }));
    });

    studentSocket.on('connect_error', (err) => {
      console.log('[STUDENT] Connect error:', err.message);
    });

    // Connect admin socket after a delay
    setTimeout(() => {
      console.log('\n[ADMIN SOCKET] Connecting...');
      adminSocket = io('http://localhost:5000', {
        auth: { token: adminToken },
        transports: ['websocket', 'polling'],
      });

      adminSocket.on('connect', () => {
        console.log('[ADMIN SOCKET] Connected:', adminSocket.id);
        adminSocket.emit('join_room', {});

        // Wait for receive_message from student
        setTimeout(() => {
          console.log('[ADMIN] Opening conversation (emitting message_seen)');
          adminSocket.emit('message_seen', { conversationId: convId });
        }, 1000);
      });

      adminSocket.on('receive_message', (payload) => {
        console.log('[ADMIN] Received receive_message:', JSON.stringify({
          conversationId: payload.conversationId,
          unreadStudent: payload.unreadStudent,
          unreadAdmin: payload.unreadAdmin,
        }));
      });

      adminSocket.on('message_seen', (payload) => {
        console.log('[ADMIN] Received message_seen:', JSON.stringify({
          conversationId: payload.conversationId,
          seenBy: payload.seenBy,
          seenByRole: payload.seenByRole,
          unreadStudent: payload.unreadStudent,
          unreadAdmin: payload.unreadAdmin,
        }));
      });

      adminSocket.on('error', (err) => {
        console.log('[ADMIN] Socket error:', JSON.stringify({ code: err?.code, message: err?.message }));
      });
    }, 3000); // Delay to let student message propagate first

    // Clean up after 8 seconds
    setTimeout(() => {
      console.log('\n[TEST] Test complete, disconnecting...');
      if (studentSocket) studentSocket.disconnect();
      if (adminSocket) adminSocket.disconnect();
      server.kill();
      process.exit(0);
    }, 8000);
  }
}

runTest().catch(err => console.log('[TEST ERROR]', err.message));
