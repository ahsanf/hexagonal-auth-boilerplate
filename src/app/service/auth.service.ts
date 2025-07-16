import { UserSqlAdapter } from "@adapter_out/mysql/user/adapter/user.adapter";
import { IUserSqlAdapter } from "@adapter_out/mysql/user/adapter/user.base_adapter";
import { RefreshToken } from "@domain/refresh_token";
import { User, UserLoginResponse } from "@domain/user";
import { logger } from "@logger";
import { IAuthUseCase } from "@use_case/auth_use_case";
import { ApplicationError } from "@util/error/application_error";
import { HttpError } from "@util/error/type/http_error";
import Bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { decryptAccessToken, generateAccessToken } from "../../util/jwt/jwt_helper";
import moment from "moment";
import { IRefreshTokenSqlAdapter } from "@adapter_out/mysql/refresh_token/adapter/refresh_token.base_adapter";
import { RefreshTokenSqlAdapter } from "@adapter_out/mysql/refresh_token/adapter/refresh_token.adapter";

export class AuthService implements IAuthUseCase {
  private readonly userSqlAdapter: IUserSqlAdapter;
  private readonly refreshTokenSqlAdapter: IRefreshTokenSqlAdapter;
  private expiredRefreshToken: number = 30

  constructor(){
    this.userSqlAdapter = new UserSqlAdapter();
    this.refreshTokenSqlAdapter = new RefreshTokenSqlAdapter();
  }
  
  async login(data: Partial<User>, traceId?: string): Promise<UserLoginResponse> {
    logger.info(this.login.name, AuthService.name, traceId);
    
    if((!data.email || !data.username ) || !data.password) {
      throw new ApplicationError(HttpError('User/password required').BAD_REQUEST)
    }

    const user = await this.userSqlAdapter.getByUsernameOrEmail(data.username || data.email, traceId);

    if (!user) {
      throw new ApplicationError(HttpError('User not found').UNPROCESSABLE_ENTITY);
    }

    if(!Bcrypt.compare(data.password, user.password)){
      throw new ApplicationError(HttpError('Invalid credentials').UNAUTHORIZED);
    }

    const accessToken = await generateAccessToken({
      id: user.id.toString(),
      email: user.email,
      roles: user.roles,
    });


    const refreshTokenResult = await this.handleRefreshToken(user.id, traceId);

    await this.userSqlAdapter.update(user.id, {
      lastLogin: new Date(),
    }, traceId);

    return {
      user: user,
      accessToken: {
        token: accessToken,
        expiresIn: moment().add(24, 'hours').toDate(),
      },
      refreshToken: {
        token: refreshTokenResult.token,
        expiresIn: refreshTokenResult.expiredAt,
      }
    }
  
  }
  
  async register(data: Partial<User>, traceId?: string): Promise<UserLoginResponse> {
    logger.info(this.register.name, AuthService.name, traceId);
    throw new Error("Method not implemented."); 
  }
  
  async logout(accessToken: string, refreshToken: string, traceId?: string): Promise<void> {
    logger.info(this.logout.name, AuthService.name, traceId);
    throw new Error("Method not implemented.");
  }
  
  async verifyOtp(otpRequest: string, otpCode: string, traceId?: string): Promise<string> {
    logger.info(this.verifyOtp.name, AuthService.name, traceId);
    throw new Error("Method not implemented.");
  }
  
  
  async refreshAccessToken(refreshToken: string, traceId?: string): Promise<UserLoginResponse> {
    logger.info(this.refreshAccessToken.name, AuthService.name, traceId);
    throw new Error("Method not implemented.");
  }

  async changePassword(id: number, data: {oldPassword: string, newPassword: string},  traceId?: string): Promise<void>{
    logger.info(this.changePassword.name, AuthService.name, traceId);
    const user = await this.userSqlAdapter.getById(id, traceId)

    if(!user){
      throw new ApplicationError(HttpError('User not found').UNPROCESSABLE_ENTITY)
    }

    if(!Bcrypt.compareSync(data.oldPassword, user.password)){
      throw new ApplicationError(HttpError('Old password not match').UNPROCESSABLE_ENTITY)
    }

    if(Bcrypt.compareSync(data.newPassword, user.password)){
      throw new ApplicationError(HttpError('Same with old password').UNPROCESSABLE_ENTITY)
    }

    const newPassword = await Bcrypt.hash(data.newPassword, 10)


    await this.userSqlAdapter.update(id, {
      password: newPassword,
      updatedAt: new Date()
    }, traceId)

  }

  async handleRefreshToken(userId: number, traceId?: string): Promise<RefreshToken> {
      const token = await this.refreshTokenSqlAdapter.getByUserId(userId, traceId);
      if (token && token.id) {
        if (moment(token.expiredAt).isAfter(moment())) {
            await this.refreshTokenSqlAdapter.update(token.id, {
            expiredAt: moment().add(this.expiredRefreshToken, 'days').toDate(),
          })
        }
        
        return token
      } else {
        let expiredAt = moment().add(this.expiredRefreshToken, 'days').toDate();
        let token = uuidv4();

        let refreshToken = {
          token: token,
          userId: userId,
          expiredAt: expiredAt,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await this.refreshTokenSqlAdapter.create(refreshToken, traceId);
        return refreshToken
      }
    }
    
}