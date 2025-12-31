import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Types } from "mongoose";
import { IOrder, IOrderProduct, orderStatusEnum, PaymentEnum } from "src/common";
import type {IUser} from "src/common";
import { OneUserResponse } from "src/modules/user/entities/user.entity";

export class OrderResponse {
    order:IOrder
}




registerEnumType(PaymentEnum, {
    name:'PaymentEnum'
})

registerEnumType(orderStatusEnum, {
    name:'orderStatusEnum'
})




@ObjectType()
export class OrderProduct  {
 
  @Field(() => ID , {nullable:true})
  id?: Types.ObjectId;
    
  @Field(() => ID)
  productId: Types.ObjectId;

  
  @Field(() => Number)
  quantity: number;
  
  @Field(() => Number)
  unitPrice: number;
  
  @Field(() => Number)
  finalPrice: number;  
   
}

@ObjectType()
export class OneOrderResponse implements IOrder {
   
    
    @Field(() => ID, { nullable: true })
    id?: Types.ObjectId;
    
    @Field(() => String)
    orderId: string;
    
    @Field(() => String)
    address: string;
    
    @Field(() => String)
    phone: string;
    
    @Field(() => String, { nullable: true })
    note?: string ;
    
    @Field(() => String, { nullable: true })
    cancelReason?: string ;
    
    
    
    @Field(() => ID, { nullable: true })
    coupon?: Types.ObjectId ;
    
    
    @Field(() => Number, { nullable: true })
    discount?: number;
   
    @Field(() => Number)
    supTotal: number;
    
    @Field(() => Number)
    total: number;
    
   
    @Field(() => String, { nullable: true })
    paidAt?: Date 
    
    @Field(() => String, { nullable: true })
    intentId?: string;
    
    @Field(() => String, { nullable: true })
    paymentIntent?: string;
    
    
    @Field(() => PaymentEnum)
    payment: PaymentEnum;
   

    @Field(() => String )
    status: orderStatusEnum;
    
    @Field(() => [OrderProduct] )
    products: IOrderProduct[];
     
   
    @Field(() => OneUserResponse)
    createdBy: IUser;
   
    @Field(() => ID, { nullable: true })
    updatedBy?: Types.ObjectId ;
    
    @Field(() => ID, { nullable: true })
    freezedBy?: Types.ObjectId ;
   
    
    @Field(() => String, { nullable: true })
    updatedAt?: Date;
    
    @Field(() => String, { nullable: true })
    freezedAt?: Date;
    
    @Field(() => String, { nullable: true })
    createdAt?: Date;
     
}

@ObjectType({description:'include paginate response contain order'})
export class GetAllOrderResponse{
    @Field(()=>Number , {nullable:true})
    docsCount?: number
    @Field(()=>Number , {nullable:true})
    limit?: number
    @Field(()=>Number , {nullable:true})
    pages?: number
    @Field(()=>Number , {nullable:true})
    currentPage?: number
    
    @Field(()=>[OneOrderResponse],{nullable:true})
    result: OneOrderResponse[]
}



















 

// @ObjectType()
// export class TokenType {
//   @Field(() => ID, { nullable: true })
//   _id?: Types.ObjectId;

//   @Field()
//   jti: string;

//   @Field()
//   expireAt: number;

//   @Field(() => ID)
//   createdBy: Types.ObjectId;

//   @Field(() => String, { nullable: true })
//   createdAt?: Date;

//   @Field(() => String, { nullable: true })
//   updatedAt?: Date;
// }
