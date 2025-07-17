export interface MailRequest{
  from: string
  to: string[]
  subject: string
  body: string
  attachments: string[]
}