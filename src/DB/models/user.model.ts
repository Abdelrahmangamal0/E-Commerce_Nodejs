import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { providerEnum } from "src/common/enums/user.enum";
import { langEnum } from "src/common/enums/lang.enum";
import { genderEnum } from "src/common/enums/user.enum";
import { roleEnum } from "src/common/enums/user.enum";
// import { providerEnum } from "src/common/enums/user.enum";
import { generateHash } from "src/common/utils/security/hash.security";
import { OtpDocument } from "./otp.model";
import { UpdateQuery } from "mongoose";
import { IUser } from "src/common";


console.log(providerEnum);


@Schema({timestamps:true , strictQuery:true , toJSON:{virtuals:true} , toObject:{virtuals:true}})
export class User implements IUser {

    @Prop({type:String,minLength:2 , maxlength:26 , required:true})
    firstName: string
    
    @Prop({type:String,minLength:2 , maxlength:26 , required:true})
    lastName: string
    
    @Virtual({
        get: function (this: User) {
            return this.firstName+' '+this.lastName
        },

        set: function (value: string) {
            const [firstName,lastName] = value.split(' ')||[]
            this.set({firstName,lastName}) 
        }
    })
    userName:string
   
    @Prop({ type: String, required: true, unique: true })
    email: string
    
    @Prop({ type: Date, required: false })
    confirmEmail:Date

    @Prop({
        required: function (this:User) {
            return this.provider === providerEnum.Google ? false : true
        }
    })
    password: string
    
    @Prop({ type: Date, required: false })
    resetPassword?: Date
   
    @Prop({ type: String, enum: providerEnum, default: providerEnum.System })
    provider:providerEnum
    
    @Prop({ type: String, enum: genderEnum, default: genderEnum.Male })
    gender:genderEnum
   
    @Prop({ type: String, enum: roleEnum, default: roleEnum.User })
    role:roleEnum

    @Prop({ type: String, enum: langEnum, default: langEnum.EN })
    preferLanguage:langEnum
    
    @Prop({type:Date , required:false})
    changeCredentialsTime:Date
    
    @Virtual()
    otp: OtpDocument[]
    
    @Prop({ type: String })
    profilePicture:string
   
    @Prop({type:[{ type: Types.ObjectId ,ref:'Product' }]})
    wishList:Types.ObjectId[]
}

const userSchema = SchemaFactory.createForClass(User)
export type userDocument = HydratedDocument<User>
userSchema.virtual('otp', {
    localField: '_id',
    foreignField: 'createdBy',
    ref:'Otp'
})
userSchema.pre('save', async function(next){
    if (this.isModified('password')) {
        this.password = await generateHash(this.password)
    }
    next()
})
userSchema.pre(['updateOne' , 'findOneAndUpdate'], async function(next){
    const update = this.getUpdate() as UpdateQuery<userDocument>
     
   
    if (update.password) {
        update.password = await generateHash(update.password)
    }
    next()
})



export const connectedSockets = new Map<string,string[]>()

export const userModel = MongooseModule.forFeature([{name:User.name , schema:userSchema}])

// export const userModel = MongooseModule.forFeatureAsync([{
//     name: User.name, useFactory:()=>{
//     userSchema.pre('save', async function (next) {
//         if (this.isModified('password')) {
//             this.password = await generateHash(this.password)
//         }
//         next()
//     })    
        
//      return   userSchema
    
//     }
        
// }])
