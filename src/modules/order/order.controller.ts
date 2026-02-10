import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {type Request } from 'express';

import { OrderService } from './order.service';
import { CreateOrderDto, OrderParamDto } from './dto/create-order.dto';
import { Auth, IResponse, User } from 'src/common';
import { endPoint } from './authorization.order';
import type { userDocument } from 'src/DB';
import { OrderResponse } from './entities/order.entity';
import { successResponse } from 'src/common/utils/response';

@ApiTags('Orders')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ========================= CREATE ORDER =========================
  @Auth(endPoint.create)
  @Post()
  @ApiOperation({
    summary: 'Create new order',
    description: 'Create order for authenticated user',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponse,
  })
  async create(
    @User() user: userDocument,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.create(createOrderDto, user);
    return successResponse<OrderResponse>({ data: { order } });
  }

  // ========================= CANCEL ORDER =========================
  @Auth(endPoint.cancel)
  @Patch(':orderId')
  @ApiOperation({
    summary: 'Cancel order',
    description: 'Cancel existing order by orderId',
  })
  @ApiParam({
    name: 'orderId',
    required: true,
    example: '65a8c3f9e13a9a23cdd12345',
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderResponse,
  })
  async cancel(
    @User() user: userDocument,
    @Param() param: OrderParamDto,
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.cancel(param.orderId, user);
    return successResponse<OrderResponse>({ data: { order } });
  }

  // ========================= STRIPE WEBHOOK =========================
  @Post('webhook')
  @ApiOperation({
    summary: 'Payment webhook',
    description: 'Handle payment gateway webhook (Stripe, Paymob, etc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook handled successfully',
  })
  async webhook(@Req() req: Request) {
    await this.orderService.webhook(req);
    return successResponse();
  }

  // ========================= CHECKOUT =========================
  @Auth(endPoint.create)
  @Post(':orderId')
  @ApiOperation({
    summary: 'Checkout order',
    description: 'Create checkout session for order',
  })
  @ApiParam({
    name: 'orderId',
    required: true,
    example: '65a8c3f9e13a9a23cdd12345',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created',
  })
  async checkout(
    @User() user: userDocument,
    @Param() param: OrderParamDto,
  ): Promise<IResponse> {
    const session = await this.orderService.checkout(param.orderId, user);
    return successResponse({ data: { session } });
  }
}
