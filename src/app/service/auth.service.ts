import { UserSqlAdapter } from "@adapter_out/mysql/user/adapter/user.adapter";
import { IUserSqlAdapter } from "@adapter_out/mysql/user/adapter/user.base_adapter";
import { RefreshToken } from "@domain/refresh_token";
import { Tracing, User, UserLoginResponse } from "@domain/user";
import { logger } from "@logger";
import { IAuthUseCase } from "@use_case/auth.use_case";
import { ApplicationError } from "@util/error/application_error";
import { HttpError } from "@util/error/type/http_error";
import Bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { decryptAccessToken, generateAccessToken } from "../../util/jwt/jwt_helper";
import moment from "moment";
import { IRefreshTokenSqlAdapter } from "@adapter_out/mysql/refresh_token/adapter/refresh_token.base_adapter";
import { RefreshTokenSqlAdapter } from "@adapter_out/mysql/refresh_token/adapter/refresh_token.adapter";
import otpGenerator from 'otp-generator'
import { decryptData, encryptData } from "@util/encrypt/encryption";
import { buildSendOtpEmailHTML } from "src/view/send_otp";
import { config } from "@config";
import { MailAdapter } from "@adapter_out/mailer/adapter";
import { cacheData, delCache, getFromCache } from "@util/redis/redis";

export class AuthService implements IAuthUseCase {
  private readonly userSqlAdapter: IUserSqlAdapter;
  private readonly refreshTokenSqlAdapter: IRefreshTokenSqlAdapter;
  private readonly mailAdapter: MailAdapter;

  private expiredRefreshToken: number = 30
  private senderEmail = config.mail.sender

  constructor(){
    this.userSqlAdapter = new UserSqlAdapter();
    this.refreshTokenSqlAdapter = new RefreshTokenSqlAdapter();
    this.mailAdapter = new MailAdapter();
  }
  
  async login(data: Partial<User>, tracing: Tracing, traceId?: string): Promise<UserLoginResponse> {
    logger.info(this.login.name, AuthService.name, traceId);
    
    if(!data.email && !data.password) {
      throw new ApplicationError(HttpError('User/password required').BAD_REQUEST)
    }

    if(!data.username && !data.password) {
      throw new ApplicationError(HttpError('User/password required').BAD_REQUEST)
    }

    const usernameOrEmail = data.username || data.email;

    if (!usernameOrEmail) {
      throw new ApplicationError(HttpError('Username or email required').BAD_REQUEST)
    }

    const user = await this.userSqlAdapter.getByUsernameOrEmail(usernameOrEmail, traceId);
    
    if (!user) {
      throw new ApplicationError(HttpError('User not found').UNPROCESSABLE_ENTITY);
    }

    if(!data.password || !Bcrypt.compare(data.password, user.password)){
      throw new ApplicationError(HttpError('Invalid credentials').UNAUTHORIZED);
    }

    if(!user.isActive){
      throw new ApplicationError(HttpError('User is not active').UNPROCESSABLE_ENTITY);
    } 

    const accessToken = await generateAccessToken({
      id: user.id.toString(),
      email: user.email,
      roles: user.roles as string[],
    });


    const refreshTokenResult = await this.handleRefreshToken(user.id, tracing, traceId);

    await this.userSqlAdapter.update(user.id, {
      lastLogin: new Date(),
    }, traceId);

    return {
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        lang: user.lang,
        imageUrl: user.imageUrl,
        isActive: user.isActive,
        roles: user.roles as string[],
        lastLogin: user.lastLogin,
      },
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
  
  async register(data: Partial<User>, tracing: Tracing, traceId?: string): Promise<{otpSignature: string}> {
    logger.info(this.register.name, AuthService.name, traceId);

    if(!data.email || !data.password || !data.name) {
      throw new ApplicationError(HttpError('Email, password and name are required').BAD_REQUEST);
    }

    const existingUser = await this.userSqlAdapter.getByUsernameOrEmail(data.username || data.email, traceId);

    if (existingUser) {
      throw new ApplicationError(HttpError('User already exists').UNPROCESSABLE_ENTITY);
    }

    const hashedPassword = await Bcrypt.hash(data.password, 10);

    const newUser: User = {
      id: 0,
      name: data.name,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      address: data.address,
      lang: data.lang,
      imageUrl: data.imageUrl,
      isActive: false,
      emailVerified: false,
      roles: data.roles || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertedUser = await this.userSqlAdapter.create(newUser, traceId);
    const otpCode = await this.handleOtp(insertedUser.id, insertedUser.name, insertedUser.email, false, traceId);

    return { otpSignature: otpCode}

  }
  
  async logout(accessToken: string, refreshToken: string, traceId?: string): Promise<void> {
    logger.info(this.logout.name, AuthService.name, traceId);
    const accessTokenData = await decryptAccessToken(accessToken);

    if (!accessTokenData) {
      throw new ApplicationError(HttpError('Invalid access token').UNAUTHORIZED);
    }
  
  }

  
  async refreshAccessToken(refreshToken: string, tracing: Tracing, traceId?: string): Promise<UserLoginResponse> {
    logger.info(this.refreshAccessToken.name, AuthService.name, traceId);
    let refreshTokenData = await this.refreshTokenSqlAdapter.getByToken(refreshToken, traceId);
    
    if (!refreshTokenData) {
      throw new ApplicationError(HttpError('Invalid refresh token').UNAUTHORIZED);
    }

    const user = await this.userSqlAdapter.getById(refreshTokenData.userId, traceId);

    if (!user) {
      throw new ApplicationError(HttpError('User not found').UNPROCESSABLE_ENTITY);
    }

    refreshTokenData = await this.handleRefreshToken(user.id, tracing, traceId);

    const accessToken = await generateAccessToken({
      id: user.id.toString(),
      email: user.email,
      roles: user.roles as string[],
    });

    return {
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        lang: user.lang,
        imageUrl: user.imageUrl,
        isActive: user.isActive,
        roles: user.roles as string[],
        lastLogin: user.lastLogin,
      },
      accessToken: {
        token: accessToken,
        expiresIn: moment().add(24, 'hours').toDate(),
      },
      refreshToken: {
        token: refreshTokenData.token,
        expiresIn: refreshTokenData.expiredAt,
      }
    }
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
      lastPasswordChange: new Date(),
      updatedAt: new Date()
    }, traceId)

  }

  async handleRefreshToken(userId: number, tracing: Tracing, traceId?: string): Promise<RefreshToken> {
      const token = await this.refreshTokenSqlAdapter.getByUserId(userId, traceId);
      if (token && token.id) {
        if (moment(token.expiredAt).isBefore(moment())) {
            let newRefreshToken = uuidv4();
            await this.refreshTokenSqlAdapter.update(token.id, {
              token: newRefreshToken,
              ipAddress: tracing.ipAddress,
              userAgent: tracing.userAgent,
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
          userAgent: tracing.userAgent,
          ipAddress: tracing.ipAddress,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await this.refreshTokenSqlAdapter.create(refreshToken, traceId);
        return refreshToken
      }
    }

  async resendOtp(otpSignature: string, traceId?: string): Promise<{otpRequest: string}> {
    logger.info(this.resendOtp.name, AuthService.name, traceId);
    const otpData = await decryptData(otpSignature);
    const [userId, otp, fullName, email] = otpData.split(':');

    if (!userId || !fullName || !email) {
      throw new ApplicationError(HttpError('Invalid OTP signature').UNPROCESSABLE_ENTITY);
    }

    const user = await this.userSqlAdapter.getById(parseInt(userId), traceId);

    if (!user) {
      throw new ApplicationError(HttpError('User not found').UNPROCESSABLE_ENTITY);
    }

    const signature = await this.handleOtp(parseInt(userId), fullName, email, true, traceId);

    return { otpRequest: signature }
  }

  async handleOtp(userId: number, fullName: string, email: string, isResend: boolean, traceId?: string): Promise<string> {
    logger.info(this.handleOtp.name, AuthService.name, traceId);

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false, });

    const otpCode = await encryptData(`${userId}:${otp}:${fullName}:${email}`);

    if(isResend == true)  {
      await delCache(`OTP:${userId}`);
    }

    await cacheData(`OTP:${userId}`, otpCode, 5 * 60);

    const mailContent = { fullName: fullName, otpCode: otp }

    const mailRequest = {
      from: this.senderEmail,
      to: [email],
      subject: "OTP Verification",
      body: buildSendOtpEmailHTML(mailContent),
      attachments: [],
    }

    await this.mailAdapter.send(mailRequest);

    return otpCode;
  }

  async verifyOtp(otpRequest: string, otpCode: string, traceId?: string): Promise<string> {
    logger.info(this.verifyOtp.name, AuthService.name, traceId);
    const decryptOtp: string = await decryptData(otpCode)
    const otpData: string[] = decryptOtp.split(':')
    const userId: string = otpData[0]
    const otp: string = otpData[1]

    if (otpRequest !== otp) {
      throw new ApplicationError(HttpError('Invalid OTP').UNPROCESSABLE_ENTITY);
    }

    const cachedOtp = await getFromCache(`OTP:${userId}`);

    if (!cachedOtp || cachedOtp !== otpCode) {
      throw new ApplicationError(HttpError('OTP expired or invalid').UNPROCESSABLE_ENTITY);
    }

    await delCache(`OTP:${userId}`);

    await this.userSqlAdapter.update(parseInt(userId), {
      emailVerified: true,
      isActive: true,
      updatedAt: new Date(),
    }, traceId);

    return `OTP verified`;
  }

  async forgotPassword(email: string, traceId?: string): Promise<{otpSignature: string}> {
    logger.info(this.forgotPassword.name, AuthService.name, traceId);
    if (!email) {
      throw new ApplicationError(HttpError('Email is required').BAD_REQUEST);
    } 

    const user = await this.userSqlAdapter.getByUsernameOrEmail(email, traceId);

    if (!user) {
      throw new ApplicationError(HttpError('User not found').UNPROCESSABLE_ENTITY);
    }

    const otpCode = await this.handleOtp(user.id, user.name, user.email, false, traceId);
    return { otpSignature: otpCode };
  }

  async resetPassword(otpSignature: string, newPassword: string, traceId?: string): Promise<void> {
    logger.info(this.resetPassword.name, AuthService.name, traceId);
    const otpData = await decryptData(otpSignature);
    const [userId, otp, fullName, email] = otpData.split(':');

    if (!userId || !fullName || !email) {
      throw new ApplicationError(HttpError('Invalid OTP signature').UNPROCESSABLE_ENTITY);
    }

    const user = await this.userSqlAdapter.getById(parseInt(userId), traceId);

    if (!user) {
      throw new ApplicationError(HttpError('User not found').UNPROCESSABLE_ENTITY);
    }

    if (Bcrypt.compareSync(newPassword, user.password)) {
      throw new ApplicationError(HttpError('New password cannot be the same as the old password').UNPROCESSABLE_ENTITY);
    }

    const hashedPassword = await Bcrypt.hash(newPassword, 10);

    await this.userSqlAdapter.update(parseInt(userId), {
      password: hashedPassword,
      lastPasswordChange: new Date(),
      updatedAt: new Date(),
    }, traceId);

    await delCache(`OTP:${userId}`);
  }

  async getMe(id: number, traceId?: string): Promise<UserLoginResponse> { 
    logger.info(this.getMe.name, AuthService.name, traceId);
    const user = await this.userSqlAdapter.getById(id, traceId);

    if (!user) {
      throw new ApplicationError(HttpError('User not found').UNPROCESSABLE_ENTITY);
    }

    return {
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        lang: user.lang,
        imageUrl: user.imageUrl,
        isActive: user.isActive,
        roles: user.roles as string[],
        lastLogin: user.lastLogin,
      }
    };
  }

}
