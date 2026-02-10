import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModel, CartRepository, CouponModel, CouponRepository, NotificationModel, NotificationRepository, OrderModel, OrderRepository, ProductModel, ProductRepository } from 'src/DB';
import { PaymentService, SharedAuthModule } from 'src/common';
import { RealTimeGateway } from '../gateway/gateway';
import { OrderResolver } from './resolver';

@Module({
  imports:[CartModel,ProductModel,OrderModel , CouponModel , SharedAuthModule , NotificationModel],
  controllers: [OrderController],
  providers: [OrderService , CartRepository , ProductRepository,OrderRepository , CouponRepository , PaymentService , RealTimeGateway , OrderResolver , NotificationRepository],
})
export class OrderModule {}
