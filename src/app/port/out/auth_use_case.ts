import { User, UserLoginResponse } from "@domain/user"

export interface IAuthUseCase {
  login(data: Partial<User>, traceId?: string): Promise<UserLoginResponse>
  register(data: Partial<User>, traceId?: string): Promise<UserLoginResponse>
  logout(accessToken: string, refreshToken: string, traceId?: string ): Promise<void>
  changePassword(id: number, data: {oldPassword: string, newPassword: string},  traceId?: string): Promise<void>

  verifyOtp(otpRequest: string, otpSignature: string, traceId?: string ): Promise<string>
  refreshAccessToken(refreshToken: string, traceId?: string ): Promise<UserLoginResponse>
}
