import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { emailEvent } from "src/common";
import { otpEnum } from "src/common/enums/otp.enum";
import { IOtp } from "src/common/interface/otp.interface";
import { generateHash } from "src/common/utils/security/hash.security";

@Schema({timestamps:true})
export class Otp implements IOtp {
    @Prop({type:String , required:true }) 
    code: string
    
    @Prop({type:Date, required:true})
    expiredAt: Date
    @Prop({type:Types.ObjectId , ref:'User' , required:true})
    createdBy: Types.ObjectId
    
    @Prop({type:String , enum:otpEnum , required:true } )
    type: otpEnum
    

}

export type OtpDocument = HydratedDocument<Otp>

const OtpSchema = SchemaFactory.createForClass(Otp)

OtpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })

OtpSchema.pre('save', async function (
    this:OtpDocument & {wasNew:boolean , plaintext:string},
    next
) {
    
    this.wasNew = this.isNew
    if (
        this.isModified('code')) {
        this.plaintext = this.code
        this.code = await generateHash(this.code)
        await this.populate([{path:'createdBy' , select:'email'}])
    } 
     next()
})


OtpSchema.post('save', function(doc, next){
   const that = this as OtpDocument & { wasNew: boolean, plaintext: string } 
    if (that.wasNew && that.plaintext) {
        emailEvent.emit(doc.type, {
            to: (that.createdBy as any).email,
            otp:that.plaintext   
      })
    }

    next()
})

export const otpModel = MongooseModule.forFeature([{name:Otp.name , schema:OtpSchema}])
