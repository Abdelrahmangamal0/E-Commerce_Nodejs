import { BadRequestException } from "@nestjs/common";
import { Multer } from "multer";
import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";


export const sendEmail = async (data: Mail.Options) => {
    if (!data.html && !data.attachments?.length && !data.text) {
        throw new BadRequestException('Miss Email Content')
   
    }
    const transport = createTransport({
        service: 'gmail',
        auth: {
            user:process.env.EMAIL as string,
            pass:process.env.PASSWORD as string
        }
 })

    const info = await transport.sendMail({
      ...data,
        from:`"${process.env.APP_NAME} ☘️" <${process.env.EMAIL as string} > ` 
    })
console.log('Message Send : ' , info.messageId);


}
