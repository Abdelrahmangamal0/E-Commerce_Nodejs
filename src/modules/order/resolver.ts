import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrderService } from "./order.service";
import { GetAllOrderResponse } from "./entities/order.entity";
import { Auth, GetAllGraphQlDTO, IOrder, roleEnum, User } from "src/common";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import type { userDocument } from "src/DB";


@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Resolver()
export class OrderResolver{
    constructor(
        private readonly orderService:OrderService
    ) { }

    @Auth([roleEnum.Admin])
    @Query(() => GetAllOrderResponse, { name: 'AllOrders', description: 'retrieve all Orders' })
    async allOrders(
        @User() user:userDocument,
        @Args('data',
            { nullable: true }) getAllGraphQlDTO?: GetAllGraphQlDTO
        
    ) {
        const result = await this.orderService.findAll(getAllGraphQlDTO)
        console.log(user );
        
        return result
    }
    
    @Mutation(() => String)
    updateOrder():string {
        return ' Order'
    }
    
}