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
  roles?: string[]
  lastLogin?: Date
  lastPasswordChange?: Date
  emailVerified?: boolean
  refreshToken?: string
  googleId?: string
  createdAt?: Date
  updatedAt?: Date
}

export type UserLoginResponse = {
  user:{
    id: number,
    name: string,
    email: string,
    phone?: string,
    address?: string,
    lang?: string,
    imageUrl?: string,
    isActive?: boolean,
    roles?: string[],
    lastLogin?: Date,
  },
  refreshToken?: TokenPayload,
  accessToken?: TokenPayload,
}

export type TokenPayload = {
  token: string,
  expiresIn: Date
}
