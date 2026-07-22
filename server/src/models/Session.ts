import mongoose, { Schema, model, Document } from 'mongoose'

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId
  refreshTokenHash: string
  device: string
  userAgent?: string
  ip?: string
  expiresAt: Date
  revokedAt?: Date | null
  createdAt: Date
  isRevoked(): boolean
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  refreshTokenHash: { type: String, required: true, index: true },
  device: { type: String, default: 'unknown', maxlength: 200 },
  userAgent: { type: String, maxlength: 500 },
  ip: { type: String, maxlength: 64 },
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
})

SessionSchema.methods.isRevoked = function isRevoked() {
  if (this.revokedAt) return true
  return this.expiresAt.getTime() < Date.now()
}

export const Session = (mongoose.models.Session as mongoose.Model<ISession>) || model<ISession>('Session', SessionSchema)
