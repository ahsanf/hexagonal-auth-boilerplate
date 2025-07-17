import { Attachment } from "nodemailer/lib/mailer"

export const listStringToAttachments = (data:string[]):Attachment[] => {
  let attachments:Attachment[] = []
  data.forEach(item => attachments.push({
    filename: getFilename(item),
    path: item
  }))
  return attachments
}

const getFilename = (url:string) => {
  const splitted = url.split('/')
  return splitted[splitted.length - 1]
}