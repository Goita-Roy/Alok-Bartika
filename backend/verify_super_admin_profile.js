const http = require("http")
const jwt = require("jsonwebtoken")

const SA_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNjFiMTlmZjRlODljNTI3YjM3OGVlNyIsInVzZXJJZCI6IjZhNjFiMTlmZjRlODljNTI3YjM3OGVlNyIsImVtYWlsIjoic3VwZXJhZG1pbkBhbG9rYmFydGlrYS5jb20iLCJyb2xlIjoic3VwZXItYWRtaW4iLCJpYXQiOjE3ODU1NzQ5MjEsImV4cCI6MTc4ODE2NjkyMX0.eBo0_3Uj9yQiJD1u4siCVdwNocGKyKzDufX_0w7O7Ws"
const JWT_SECRET = "alokbartika_jwt_secret_key_2026"

const ADMIN_TOKEN = jwt.sign(
  { id: "6a61b6ee5fbccf7290270a20", userId: "6a61b6ee5fbccf7290270a20", email: "admin@gmail.com", role: "admin" },
  JWT_SECRET,
  { expiresIn: "1h" }
)
const STUDENT_TOKEN = jwt.sign(
  { id: "6a6c56cd84e5161899e03614", userId: "6a6c56cd84e5161899e03614", email: "student@test.com", role: "student" },
  JWT_SECRET,
  { expiresIn: "1h" }
)

let PASS_COUNT = 0, FAIL_COUNT = 0

function PASS(label, detail) {
  PASS_COUNT++
  console.log("PASS  " + label + (detail ? "  |  " + detail : ""))
}
function FAIL(label, root) {
  FAIL_COUNT++
  console.log("FAIL  " + label + (root ? "  |  " + root : ""))
}

function apiReq(method, urlPath, token, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "127.0.0.1", port: 5000, path: urlPath, method,
      headers: { "Content-Type": "application/json", ...(token ? { "Authorization": "Bearer " + token } : {}) }
    }
    const r = http.request(opts, res => {
      let d = ""
      res.on("data", c => d += c)
      res.on("end", () => {
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(d) }) }
        catch { resolve({ status: res.statusCode, headers: res.headers, body: d }) }
      })
    })
    r.on("error", reject)
    if (body) r.write(JSON.stringify(body))
    r.end()
  })
}

async function main() {
  console.log("\n=======================================================")
  console.log(" SUPER ADMIN PROFILE & CHANGE PASSWORD VERIFICATION")
  console.log("=======================================================\n")

  // 1. GET /api/admins/me - Super Admin
  const meRes = await apiReq("GET", "/api/admins/me", SA_TOKEN)
  if (meRes.status === 200 && meRes.body.success && meRes.body.data) {
    const d = meRes.body.data
    PASS("GET /api/admins/me (Super Admin)", "id=" + d.id + ", name=" + d.fullName + ", email=" + d.email)
  } else {
    FAIL("GET /api/admins/me (Super Admin)", "Status: " + meRes.status + ", Body: " + JSON.stringify(meRes.body))
  }

  // 2. GET /api/admins/me - Auth Guards (Admin, Student, No Token)
  const meAdmin = await apiReq("GET", "/api/admins/me", ADMIN_TOKEN)
  if (meAdmin.status === 403) PASS("GET /api/admins/me (Admin -> 403)", "")
  else FAIL("GET /api/admins/me (Admin -> 403)", "Got HTTP " + meAdmin.status)

  const meStudent = await apiReq("GET", "/api/admins/me", STUDENT_TOKEN)
  if (meStudent.status === 403) PASS("GET /api/admins/me (Student -> 403)", "")
  else FAIL("GET /api/admins/me (Student -> 403)", "Got HTTP " + meStudent.status)

  const meNoTok = await apiReq("GET", "/api/admins/me", null)
  if (meNoTok.status === 401) PASS("GET /api/admins/me (No Token -> 401)", "")
  else FAIL("GET /api/admins/me (No Token -> 401)", "Got HTTP " + meNoTok.status)

  // 3. PUT /api/admins/me - Valid update
  const origName = meRes.body && meRes.body.data && meRes.body.data.fullName ? meRes.body.data.fullName : "Super Admin"
  const origPhone = meRes.body && meRes.body.data && meRes.body.data.phone ? meRes.body.data.phone : ""
  const origAvatar = meRes.body && meRes.body.data && meRes.body.data.avatar ? meRes.body.data.avatar : ""

  const updateRes = await apiReq("PUT", "/api/admins/me", SA_TOKEN, {
    fullName: "Super Admin Verified",
    phone: "+8801700000000",
    avatar: "https://example.com/sa_avatar.png"
  })
  if (updateRes.status === 200 && updateRes.body.success && updateRes.body.data && updateRes.body.data.fullName === "Super Admin Verified") {
    PASS("PUT /api/admins/me (Valid Update)", "name=" + updateRes.body.data.fullName + ", phone=" + updateRes.body.data.phone)
  } else {
    FAIL("PUT /api/admins/me (Valid Update)", "Status: " + updateRes.status + ", Body: " + JSON.stringify(updateRes.body))
  }

  // Revert profile data
  await apiReq("PUT", "/api/admins/me", SA_TOKEN, { fullName: origName, phone: origPhone, avatar: origAvatar })

  // 4. PUT /api/admins/me - Reject email change
  const emailErrRes = await apiReq("PUT", "/api/admins/me", SA_TOKEN, { email: "modified@alokbartika.com" })
  if (emailErrRes.status === 400 && emailErrRes.body && emailErrRes.body.message && emailErrRes.body.message.includes("Email cannot be changed")) {
    PASS("PUT /api/admins/me (Email change rejected -> 400)", emailErrRes.body.message)
  } else {
    FAIL("PUT /api/admins/me (Email change rejected -> 400)", "Got HTTP " + emailErrRes.status + " " + JSON.stringify(emailErrRes.body))
  }

  // 5. PUT /api/admins/me - Short name validation
  const shortNameRes = await apiReq("PUT", "/api/admins/me", SA_TOKEN, { fullName: "A" })
  if (shortNameRes.status === 400) {
    PASS("PUT /api/admins/me (Name < 2 chars rejected -> 400)", shortNameRes.body.message)
  } else {
    FAIL("PUT /api/admins/me (Name < 2 chars rejected -> 400)", "Got HTTP " + shortNameRes.status)
  }

  // 6. PUT /api/admins/change-password - Validations
  // 6a. Missing fields
  const passMissRes = await apiReq("PUT", "/api/admins/change-password", SA_TOKEN, { currentPassword: "SuperAdmin@123" })
  if (passMissRes.status === 400) PASS("PUT /api/admins/change-password (Missing fields -> 400)", passMissRes.body.message)
  else FAIL("PUT /api/admins/change-password (Missing fields -> 400)", "Got HTTP " + passMissRes.status)

  // 6b. Confirm mismatch
  const passMismatchRes = await apiReq("PUT", "/api/admins/change-password", SA_TOKEN, {
    currentPassword: "SuperAdmin@123", newPassword: "NewSuperAdmin@123", confirmPassword: "NewSuperAdmin@456"
  })
  if (passMismatchRes.status === 400) PASS("PUT /api/admins/change-password (Mismatch -> 400)", passMismatchRes.body.message)
  else FAIL("PUT /api/admins/change-password (Mismatch -> 400)", "Got HTTP " + passMismatchRes.status)

  // 6c. Weak password
  const passWeakRes = await apiReq("PUT", "/api/admins/change-password", SA_TOKEN, {
    currentPassword: "SuperAdmin@123", newPassword: "weak", confirmPassword: "weak"
  })
  if (passWeakRes.status === 400) PASS("PUT /api/admins/change-password (Weak password -> 400)", passWeakRes.body.message)
  else FAIL("PUT /api/admins/change-password (Weak password -> 400)", "Got HTTP " + passWeakRes.status)

  // 6d. Incorrect current password
  const passWrongRes = await apiReq("PUT", "/api/admins/change-password", SA_TOKEN, {
    currentPassword: "WrongPassword@123", newPassword: "NewSuperAdmin@123", confirmPassword: "NewSuperAdmin@123"
  })
  if (passWrongRes.status === 400 && passWrongRes.body && passWrongRes.body.message && passWrongRes.body.message.includes("incorrect")) {
    PASS("PUT /api/admins/change-password (Incorrect current password -> 400)", passWrongRes.body.message)
  } else {
    FAIL("PUT /api/admins/change-password (Incorrect current password -> 400)", "Got HTTP " + passWrongRes.status + " " + JSON.stringify(passWrongRes.body))
  }

  // 7. PUT /api/admins/change-password - Successful change & Revert
  const TEMP_PASS = "SuperAdminNewPass@2026"
  const changeOkRes = await apiReq("PUT", "/api/admins/change-password", SA_TOKEN, {
    currentPassword: "SuperAdmin@123", newPassword: TEMP_PASS, confirmPassword: TEMP_PASS
  })
  if (changeOkRes.status === 200 && changeOkRes.body.success) {
    PASS("PUT /api/admins/change-password (Password Change -> 200)", changeOkRes.body.message)

    // Test login with new password
    const loginRes = await apiReq("POST", "/api/auth/login", null, {
      email: "superadmin@alokbartika.com", password: TEMP_PASS
    })
    if (loginRes.status === 200 && loginRes.body.token) {
      PASS("Login with new password -> 200", "Token issued")

      // Revert back to SuperAdmin@123 using the new token
      const revertRes = await apiReq("PUT", "/api/admins/change-password", loginRes.body.token, {
        currentPassword: TEMP_PASS, newPassword: "SuperAdmin@123", confirmPassword: "SuperAdmin@123"
      })
      if (revertRes.status === 200) {
        PASS("Reverted password back to default -> 200", "")
      } else {
        FAIL("Reverted password back to default -> 200", "Got HTTP " + revertRes.status + " " + JSON.stringify(revertRes.body))
      }
    } else {
      FAIL("Login with new password -> 200", "Got HTTP " + loginRes.status + " " + JSON.stringify(loginRes.body))
    }
  } else {
    FAIL("PUT /api/admins/change-password (Password Change -> 200)", "Got HTTP " + changeOkRes.status + " " + JSON.stringify(changeOkRes.body))
  }

  console.log("\n=======================================================")
  console.log(" SUMMARY: " + PASS_COUNT + " PASS   " + FAIL_COUNT + " FAIL")
  console.log("=======================================================\n")
}

main().catch(e => { console.error("Fatal:", e && e.stack ? e.stack : e); process.exit(1) })
