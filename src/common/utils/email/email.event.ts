import EventEmitter from "events";
import Mail from "nodemailer/lib/mailer";
import { verifyEmail } from "./email.template";
import { sendEmail } from "./send.email";
import { otpEnum } from "src/common/enums/otp.enum";


export const emailEvent = new EventEmitter()

interface IEmail extends Mail.Options{
    otp:string
}

emailEvent.on(otpEnum.confirmEmail,async(data: IEmail) => {
   try {
       data.subject= otpEnum.confirmEmail,
       data.html = verifyEmail({ title: otpEnum.confirmEmail, otp: data.otp }),
       await sendEmail(data)    
    
   } catch (error) {
    console.log('fail to send email',error)  
   }
})

emailEvent.on('reset_password', async (data:IEmail) => {
    try {
        
        data.subject = 'reset_password'
        data.html = verifyEmail({ title: 'Email Verify', otp: data.otp })
        await sendEmail(data)

    } catch (error) {
        
        console.log('fail to send otp',error)
    }
})
