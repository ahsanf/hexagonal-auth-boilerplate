import { Tracing, User, UserLoginResponse } from "@domain/user"

export interface IAuthUseCase {
  login(data: Partial<User>, tracing: Tracing, traceId?: string): Promise<UserLoginResponse>
  register(data: Partial<User>, tracing: Tracing, traceId?: string): Promise<{otpSignature: string}> 
  logout(accessToken: string, refreshToken: string, traceId?: string): Promise<void>
  
  changePassword(id: number, data: {oldPassword: string, newPassword: string},  traceId?: string): Promise<void>
  forgotPassword(email: string, traceId?: string): Promise<{otpSignature: string}>
  resetPassword(otpRequest: string, otpSignature: string, newPassword: string, traceId?: string): Promise<void>

  verifyOtp(otpRequest: string, otpSignature: string, traceId?: string ): Promise<string>
  resendOtp(otpSignature: string, traceId?: string): Promise<{otpRequest: string}> 
  
  refreshAccessToken(refreshToken: string, tracing: Tracing, traceId?: string): Promise<UserLoginResponse>
  getMe(id: number, traceId?: string): Promise<UserLoginResponse> 
}
