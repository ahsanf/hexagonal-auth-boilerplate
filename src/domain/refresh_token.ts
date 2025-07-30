export type RefreshToken = {
  id?: number
  userId: number
  token: string
  userAgent?: string
  ipAddress?: string
  macAddress?: string
  expiredAt: Date
  createdAt?: Date
  updatedAt?: Date
}