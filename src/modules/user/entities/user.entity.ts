import { type IOtp, IUser, OneOtpResponse } from "src/common";
import { Field, ID, ObjectType, registerEnumType} from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { IProduct } from '../../../common';
import { providerEnum, genderEnum, roleEnum, langEnum } from '../../../common/enums';
import { Otp } from "src/DB";

export class ProfileResponse{
    profile:IUser
   
}





registerEnumType(providerEnum, { name: 'ProviderEnum' });
registerEnumType(genderEnum, { name: 'GenderEnum' });
registerEnumType(roleEnum, { name: 'RoleEnum' });
registerEnumType(langEnum, { name: 'LangEnum' });

@ObjectType()
export class OneUserResponse implements IUser{
  @Field(() => ID, { nullable: true })
  _id?: Types.ObjectId;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  username?: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  confirmEmail?: Date;
  
  @Field(() => String, { nullable: true })
  password: string;
  
  @Field(() => String, { nullable: true })
  resetPassword?: Date;

  @Field(() => providerEnum)
  provider: providerEnum;

  @Field(() => genderEnum)
  gender: genderEnum;

  @Field(() => roleEnum)
  role: roleEnum;

  @Field(() => langEnum)
  preferLanguage: langEnum;

  @Field(() => String, { nullable: true })
  changeCredentialsTime?: Date;

  @Field(() => [OneOtpResponse], { nullable: true })
  otp?: (Document<unknown, {}, Otp, {}, {}> & Otp & { _id: Types.ObjectId; } & { __v: number; })[] ;
  @Field({ nullable: true })
  profilePicture?: string;

  @Field(() => String, { nullable: true })
  createdAt?: Date;

  @Field(() => String, { nullable: true })
  updatedAt?: Date;

  @Field(() => [ID])
  wishList: Types.ObjectId[] | IProduct[];
}




