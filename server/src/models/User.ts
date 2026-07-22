import mongoose, { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  role: 'student' | 'admin'
  fullName: string
  email: string
  phone: string
  passwordHash: string
  authProvider: 'local' | 'google'
  googleId?: string
  picture?: string
  username?: string
  student?: {
    institution?: string
    department?: string
    batch?: string
    roll?: string
    address?: string
    guardianName?: string
    guardianPhone?: string
  }
  // Brute-force / lockout tracking
  failedLoginAttempts: number
  lockUntil?: Date | null
  lastLoginAt?: Date | null
  tokenVersion: number
  createdAt: Date
  updatedAt: Date
  verifyPassword(password: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },
    fullName: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, select: false },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, trim: true, unique: true, sparse: true },
    picture: { type: String, trim: true },
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    student: {
      institution: { type: String, trim: true },
      department: { type: String, trim: true },
      batch: { type: String, trim: true },
      roll: { type: String, trim: true },
      address: { type: String, trim: true },
      guardianName: { type: String, trim: true },
      guardianPhone: { type: String, trim: true },
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
)

UserSchema.methods.verifyPassword = function verifyPassword(password: string) {
  return require('bcryptjs').compare(password, this.passwordHash)
}

UserSchema.statics.hashPassword = async function hashPassword(password: string, cost = 12) {
  const bcrypt = require('bcryptjs')
  const salt = await bcrypt.genSalt(cost)
  return bcrypt.hash(password, salt)
}

export const User = (mongoose.models.User as mongoose.Model<IUser>) || model<IUser>('User', UserSchema)
