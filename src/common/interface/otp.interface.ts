import { Types } from "mongoose"
import { otpEnum } from "../enums"
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export interface IOtp{
         _id?:Types.ObjectId
         code: string 
         expiredAt: Date
         createdBy: Types.ObjectId
         type: otpEnum
         createdAt?: Date
         updatedAt?:Date
 
}
 

registerEnumType(otpEnum, { name: 'OtpEnum' });

@ObjectType()
export class OneOtpResponse implements IOtp {
  @Field(() => ID, { nullable: true })
  _id?: Types.ObjectId;

  @Field()
  code: string;

  @Field(() => String)
  expiredAt: Date;

  @Field(() => ID)
  createdBy: Types.ObjectId;

  @Field(() => otpEnum)
  type: otpEnum;

  @Field(() => String, { nullable: true })
  createdAt?: Date;

  @Field(() => String, { nullable: true })
  updatedAt?: Date;
}
