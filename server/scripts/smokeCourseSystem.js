const base = 'http://localhost:5000'

async function post(path, body, token) {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json() }
}

async function get(path, token) {
  const res = await fetch(base + path, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  return { status: res.status, body: await res.json() }
}

function randPhone(prefix) {
  return prefix + String(Math.floor(Math.random() * 1e9)).padStart(9, '0')
}

async function main() {
  const admin = {
    fullName: 'Admin User',
    email: `admin${Date.now()}@ex.com`,
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
    fullName: 'Course Student',
    email: `stud${Date.now()}@ex.com`,
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

  const ar = await post('/api/auth/register', admin)
  const at = ar.body.token
  const sr = await post('/api/auth/register', student)
  const st = sr.body.token

  const c = await post(
    '/api/admin/courses',
    { title: 'Coding for Kids', description: 'Start coding with fun!', level: 'Beginner', order: 0, published: true },
    at,
  )
  console.log('course', c.status)
  const courseId = c.body.course?._id ?? c.body.course?.id

  const l1 = await post(
    '/api/admin/lessons',
    {
      courseId,
      title: 'Hello World',
      slug: 'hello-world',
      order: 0,
      reading: { markdown: 'Say hello!' },
      video: { url: '' },
      practice: { prompt: 'Write Hello World', starterCode: 'console.log("Hello World")' },
    },
    at,
  )
  const l2 = await post(
    '/api/admin/lessons',
    {
      courseId,
      title: 'Variables',
      slug: 'variables',
      order: 1,
      reading: { markdown: 'Variables store values.' },
      video: { url: '' },
      practice: { prompt: 'Make a variable', starterCode: 'let x = 5' },
    },
    at,
  )
  const lesson2Id = l2.body.lesson?._id ?? l2.body.lesson?.id

  const list1 = await get(`/api/courses/${courseId}/lessons`, st)
  console.log('lesson2 locked initially', list1.body.lessons?.[1]?.locked)

  const lockedTry = await get(`/api/lessons/${lesson2Id}`, st)
  console.log('locked access status', lockedTry.status)

  const lesson1Id = l1.body.lesson?._id ?? l1.body.lesson?.id
  const complete1 = await post('/api/progress/complete', { courseId, lessonId: lesson1Id }, st)
  console.log('complete1', complete1.status)

  const list2 = await get(`/api/courses/${courseId}/lessons`, st)
  console.log('lesson2 locked after completing lesson1', list2.body.lessons?.[1]?.locked)

  const open2 = await get(`/api/lessons/${lesson2Id}`, st)
  console.log('open2 status', open2.status)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

