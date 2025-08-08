import nodemailer from 'nodemailer'
import { logger } from "../../../util/logger/logger"
import { listStringToAttachments } from "./converter"
import { MailRequest } from "./entity"
import { config } from '@config'

export class MailAdapter {
  private transporter

  constructor () {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass,
      },
      port: parseInt(config.mail.port),
    })
  }

  async send (mailRequest:MailRequest): Promise<string> {
    logger.info(this.send.name, MailAdapter.name)
    try{
      let info = await this.transporter.sendMail({
        from: mailRequest.from,
        to: mailRequest.to.join(', '),
        subject: mailRequest.subject,
        html: mailRequest.body,
        attachments: listStringToAttachments(mailRequest.attachments),
      })
      console.log('Message sent: %s', info.messageId)
      return Promise.resolve(info.messageId)
    }catch(e: any){
      logger.error(this.send.name, MailAdapter.name, e.message)
      return Promise.reject(e)
    }
  }
}