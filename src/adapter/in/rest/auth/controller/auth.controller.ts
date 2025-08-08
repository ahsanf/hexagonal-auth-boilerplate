import { BaseController } from "@common/base_controller"
import { config } from "@config"
import { Tracing } from "@domain/user"
import { getLogTraceId } from "@logger"
import { AuthService } from "@service/auth.service"
import { IAuthUseCase } from "@use_case/auth.use_case"
import { dataToRestResponse } from "@util/converter/global_converter"
import { errorHandler } from "@util/error/error_handler"
import { globalAuthMiddleware } from "@util/middlewares/global_auth"
import { Request, Response, Express } from "express"
import { refreshTokenMiddleware } from "../middleware/refresh_token.middleware"

export class AuthRestController implements BaseController {
  private app: Express
  private readonly authService: IAuthUseCase

  constructor(app: Express) {
    this.app = app
    this.authService = new AuthService()
  }

  init(): void {
    this.app.post("/auth/login", this.handleLogin.bind(this))
    this.app.post("/auth/register", this.handleRegister.bind(this))

    this.app.post("/auth/logout", globalAuthMiddleware,  this.handleLogout.bind(this))
    this.app.put("/auth/change-password", globalAuthMiddleware, this.handleChangePassword.bind(this))
    this.app.get("/auth/me", globalAuthMiddleware, this.handleGetMe.bind(this))

    this.app.post("/auth/verify-otp", this.handleVerifyOtp.bind(this))
    this.app.post("/auth/resend-otp", this.handleResendOtp.bind(this))

    this.app.post("/auth/forgot-password", this.handleForgotPassword.bind(this))
    this.app.post("/auth/reset-password", this.handleResetPassword.bind(this))
    this.app.post("/auth/refresh-access-token", refreshTokenMiddleware, this.handleRefreshAccessToken.bind(this))
  }

  private async handleLogin(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body
      const tracing: Tracing = {
        userAgent: req.headers["user-agent"] || "",
        ipAddress: req.ip,
        macAddress: req.headers["mac-address"] as string || ""
      }

      const result = await this.authService.login(data, tracing, getLogTraceId())
      const response = dataToRestResponse(result)
      res
          .cookie("refreshToken", result.refreshToken, {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
            domain: config.app.appCookieUrl ?? 'localhost'
          })
          .cookie("accessToken", result.accessToken, {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
            domain: config.app.appCookieUrl ?? 'localhost'
          })
          .json(response)
      
      res.status(200).json(response)
    } catch (error) {
      errorHandler(error, res)
    }
  }


  private async handleRegister(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body
      const tracing = {
        userAgent: req.headers["user-agent"] || "",
        ipAddress: req.ip,
      }
      const result = await this.authService.register(data, tracing, getLogTraceId())
      const response = dataToRestResponse(result)

      res.status(201).json(response)
    } catch (error) {
      errorHandler(error, res)
    }
  }

  private async handleLogout(req: Request, res: Response): Promise<void> {
    try {
      const accessToken = req.cookies.accessToken
      const refreshToken = req.cookies.refreshToken
      await this.authService.logout(accessToken, refreshToken, getLogTraceId())
      
      res.clearCookie("refreshToken", {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        domain: config.app.appCookieUrl ?? 'localhost'
      })
      res.clearCookie("accessToken", {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        domain: config.app.appCookieUrl ?? 'localhost'
      })
      
      res.status(204).send()
    } catch (error) {
      errorHandler(error, res)
    }
  }

  private async handleChangePassword(req: Request, res: Response): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body
      const userId = res.locals.user.id
      await this.authService.changePassword(userId, { oldPassword, newPassword }, getLogTraceId())
      
      res.status(204).send(dataToRestResponse(null))
    } catch (error) {
      errorHandler(error, res)
    }
  }

  private async handleVerifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { otpRequest, otpSignature } = req.body
      const traceId = getLogTraceId()
      const result = await this.authService.verifyOtp(otpRequest, otpSignature, traceId)
      
      res.status(200).json(dataToRestResponse(result))
    } catch (error) {
      errorHandler(error, res)
    }
  }

  private async handleResendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { otpSignature } = req.body
      const traceId = getLogTraceId()
      const result = await this.authService.resendOtp(otpSignature, traceId)
      
      res.status(200).json(dataToRestResponse(result))
    } catch (error) {
      errorHandler(error, res)
    }
  }


  private async handleRefreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken
      const tracing = {
        userAgent: req.headers["user-agent"] || "",
        ipAddress: req.ip,
        macAddress: req.headers["mac-address"] as string || ""
      }
      const result = await this.authService.refreshAccessToken(refreshToken.token, tracing, getLogTraceId())
      res.status(200).json(dataToRestResponse(result))
    } catch (error) {
      errorHandler(error, res)
    }
  }


  private async handleForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body
      const traceId = getLogTraceId()
      const result = await this.authService.forgotPassword(email, traceId)  
      res.status(200).json(dataToRestResponse(result))
    } catch (error) {
      errorHandler(error, res)
    }
  }

  private async handleResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { otpRequest, otpSignature, newPassword } = req.body
      const traceId = getLogTraceId()
      await this.authService.resetPassword(otpRequest, otpSignature, newPassword, traceId)
      
      res.status(204).send(dataToRestResponse(null))
    } catch (error) {
      errorHandler(error, res)
    }
  }

  private async handleGetMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = res.locals.user.id
      const result = await this.authService.getMe(userId, getLogTraceId())
      res.status(200).json(dataToRestResponse(result))
    } catch (error) {
      errorHandler(error, res)
    }
  }
}
