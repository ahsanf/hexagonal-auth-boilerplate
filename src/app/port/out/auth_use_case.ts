import { User, UserLoginResponse } from "@domain/user";

export interface IAuthUseCase {
    login(data: Partial<User>, traceId?: string): Promise<UserLoginResponse>
    register(data: Partial<User>, traceId?: string): Promise<UserLoginResponse>
}