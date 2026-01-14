import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderParamDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Auth, IResponse, User } from 'src/common';
import { endPoint } from './authorization.order';
import type { userDocument } from 'src/DB';
import { OrderResponse } from './entities/order.entity';
import { successResponse } from 'src/common/utils/response';
import type{ Request } from 'express';


@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Auth(endPoint.create)
  @Post()
  async create(
    @User() user: userDocument,
    @Body() createOrderDto: CreateOrderDto
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.create(createOrderDto, user);
    return successResponse<OrderResponse>({ data: { order } })
  }


  @Auth(endPoint.cancel)
  @Patch(':orderId')
  async cancel(
    @User() user: userDocument,
    @Param() param:OrderParamDto
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.cancel(param.orderId, user);
    return successResponse<OrderResponse>({ data: { order } })
  }

   
  @Post('webhook')
  async webhook(
    @Req() req: Request
  ) {
    // console.log(req);
    
    await this.orderService.webhook(req)
    return successResponse()
  }
  
  @Auth(endPoint.create)
  @Post(":orderId")
  async checkout(
    @User() user: userDocument,
    @Param() param: OrderParamDto
  ): Promise<IResponse> {
    const session = await this.orderService.checkout(param.orderId, user);
    return successResponse({ data: { session } })
  }

  
 

}