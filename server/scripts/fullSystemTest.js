const base = 'http://localhost:5000'

async function request(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  let payload = {}
  try {
    payload = await res.json()
  } catch {
    payload = {}
  }
  return { status: res.status, payload }
}

function randPhone(prefix) {
  return prefix + String(Math.floor(Math.random() * 1e9)).padStart(9, '0')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function run() {
  const suffix = Date.now()
  const admin = {
    fullName: 'System Admin',
    email: `admin${suffix}@ex.com`,
    phone: randPhone('+88019'),
    password: 'password123',
    role: 'admin',
    institution: 'X',
    department: 'X',
    batch: 'X',
    roll: 'X',
    address: 'X',
    guardianName: 'X',
    guardianPhone: '+8801712345678',
  }
  const student = {
    fullName: 'System Student',
    email: `student${suffix}@ex.com`,
    phone: randPhone('+88018'),
    password: 'password123',
    role: 'student',
    institution: 'X',
    department: 'X',
    batch: 'X',
    roll: 'X',
    address: 'X',
    guardianName: 'X',
    guardianPhone: '+8801712345678',
  }

  // Authentication flow
  const adminReg = await request('/api/auth/register', { method: 'POST', body: admin })
  assert(adminReg.status === 201, `Admin register failed (${adminReg.status})`)
  const adminToken = adminReg.payload.token
  const studentReg = await request('/api/auth/register', { method: 'POST', body: student })
  assert(studentReg.status === 201, `Student register failed (${studentReg.status})`)
  const studentToken = studentReg.payload.token
  const adminLogin = await request('/api/auth/login', { method: 'POST', body: { emailOrPhone: admin.email, password: admin.password } })
  assert(adminLogin.status === 200, `Admin login failed (${adminLogin.status})`)
  const studentLogin = await request('/api/auth/login', { method: 'POST', body: { emailOrPhone: student.phone, password: student.password } })
  assert(studentLogin.status === 200, `Student login failed (${studentLogin.status})`)

  // Course and lesson management
  const courseCreate = await request('/api/admin/courses', {
    method: 'POST',
    token: adminToken,
    body: { title: 'System Testing Course', description: 'E2E flow', level: 'Beginner', order: 0, published: true },
  })
  assert(courseCreate.status === 201, `Course create failed (${courseCreate.status})`)
  const courseId = String(courseCreate.payload.course?._id ?? courseCreate.payload.course?.id)
  assert(Boolean(courseId), 'Course id missing')

  const lessonA = await request('/api/admin/lessons', {
    method: 'POST',
    token: adminToken,
    body: {
      courseId,
      title: 'Lesson A',
      slug: `lesson-a-${suffix}`,
      order: 0,
      reading: { markdown: 'A' },
      video: { url: '' },
      practice: { prompt: 'Print 1', starterCode: 'print(1)' },
    },
  })
  const lessonB = await request('/api/admin/lessons', {
    method: 'POST',
    token: adminToken,
    body: {
      courseId,
      title: 'Lesson B',
      slug: `lesson-b-${suffix}`,
      order: 1,
      reading: { markdown: 'B' },
      video: { url: '' },
      practice: { prompt: 'Print 2', starterCode: 'print(2)' },
    },
  })
  assert(lessonA.status === 201 && lessonB.status === 201, `Lesson creation failed (${lessonA.status}, ${lessonB.status})`)
  const lessonAId = String(lessonA.payload.lesson?._id ?? lessonA.payload.lesson?.id)
  const lessonBId = String(lessonB.payload.lesson?._id ?? lessonB.payload.lesson?.id)

  // Course navigation + lock behavior
  const listBefore = await request(`/api/courses/${courseId}/lessons`, { token: studentToken })
  assert(listBefore.status === 200, `Lessons list failed (${listBefore.status})`)
  const secondBefore = listBefore.payload.lessons?.[1]
  assert(secondBefore?.locked === true, 'Second lesson should be locked before completion')
  const lockedOpen = await request(`/api/lessons/${lessonBId}`, { token: studentToken })
  assert(lockedOpen.status === 403, `Locked lesson access should fail (${lockedOpen.status})`)

  // Lesson completion flow
  for (const mode of ['reading', 'video', 'practice']) {
    const complete = await request('/api/progress/complete', {
      method: 'POST',
      token: studentToken,
      body: { courseId, lessonId: lessonAId, mode },
    })
    assert(complete.status === 200, `Lesson completion failed for mode ${mode} (${complete.status})`)
  }
  const listAfter = await request(`/api/courses/${courseId}/lessons`, { token: studentToken })
  assert(listAfter.status === 200, `Lessons list after completion failed (${listAfter.status})`)
  const secondAfter = listAfter.payload.lessons?.[1]
  assert(secondAfter?.locked === false, 'Second lesson should unlock after completing first lesson')
  const openSecond = await request(`/api/lessons/${lessonBId}`, { token: studentToken })
  assert(openSecond.status === 200, `Unlocked lesson open failed (${openSecond.status})`)

  // Code execution
  const exec = await request('/api/execute/python', {
    method: 'POST',
    token: studentToken,
    body: { sourceCode: 'print(123)', stdin: '' },
  })
  assert(exec.status === 200 || exec.status === 502, `Execution endpoint unexpected status (${exec.status})`)
  if (exec.status === 200) {
    assert(exec.payload.ok === true, 'Execution success payload missing ok=true')
  } else {
    assert(Boolean(exec.payload.error), 'Execution 502 should include error message')
  }

  // AI hint system
  const hint = await request('/api/ai/help', {
    method: 'POST',
    token: studentToken,
    body: { sourceCode: 'print(hello)', errorOutput: 'NameError: name hello is not defined', lessonId: lessonAId },
  })
  assert(hint.status === 200, `AI hint failed (${hint.status})`)
  assert(Boolean(hint.payload.explanation), 'AI hint explanation missing')
  assert(Boolean(hint.payload.suggestedFix), 'AI hint suggestedFix missing')
  assert(Boolean(hint.payload.beginnerGuidance), 'AI hint beginnerGuidance missing')

  // Admin-only access and analytics
  const analyticsAdmin = await request('/api/admin/analytics', { token: adminToken })
  assert(analyticsAdmin.status === 200, `Admin analytics failed (${analyticsAdmin.status})`)
  assert(typeof analyticsAdmin.payload.analytics?.totalStudents === 'number', 'Analytics totalStudents missing')
  const analyticsStudent = await request('/api/admin/analytics', { token: studentToken })
  assert(analyticsStudent.status === 403, `Student should not access admin analytics (${analyticsStudent.status})`)

  // Student CRUD
  const createdByAdmin = await request('/api/admin/students', {
    method: 'POST',
    token: adminToken,
    body: {
      fullName: 'Created By Admin',
      email: `created${suffix}@ex.com`,
      phone: randPhone('+88016'),
      password: 'password123',
      institution: 'X',
      department: 'X',
      batch: 'X',
      roll: 'X',
      address: 'X',
      guardianName: 'X',
      guardianPhone: '+8801712345678',
    },
  })
  assert(createdByAdmin.status === 201, `Admin student create failed (${createdByAdmin.status})`)

  console.log('FULL_SYSTEM_TEST:PASS')
}

run().catch((err) => {
  console.error(`FULL_SYSTEM_TEST:FAIL ${err.message}`)
  process.exit(1)
})
