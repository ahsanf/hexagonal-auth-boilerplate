export type User = {
  id: number
  name: string
  username?: string
  email: string
  password: string
  phone?: string
  address?: string
  lang?: string
  imageUrl?: string
  isActive?: boolean
  roles?: string[] | string
  lastLogin?: Date
  lastPasswordChange?: Date
  emailVerified?: boolean
  refreshToken?: string
  googleId?: string
  createdAt?: Date
  updatedAt?: Date
}

export type Tracing = {
  ipAddress?: string
  userAgent?: string
  macAddress?: string
}

export type UserLoginResponse = {
  user:{
    username?: string,
    name: string,
    email: string,
    phone?: string,
    address?: string,
    lang?: string,
    imageUrl?: string,
    isActive?: boolean,
    roles?: string[] | string,
    lastLogin?: Date,
  },
  refreshToken?: TokenPayload,
  accessToken?: TokenPayload,
}

export type TokenPayload = {
  token: string,
  expiresIn: Date
}
