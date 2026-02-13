import { Module } from '@nestjs/common';
import {
  DashboardController,
  DashboardUsersController,
  DashboardOrdersController,
  DashboardProductsController,
} from './controllers'; // تعليق: استيراد جميع الكنترولات من ملف واحد controllers
import {
  OrderModel,
  OrderRepository,
  ProductModel,
  ProductRepository,
  userModel,
  UserRepository,
} from 'src/DB';
import { SharedAuthModule } from 'src/common/services/modules/auth.module'; // تعليق: مشاركة منطق المصادقة/الصلاحيات داخل هذا الموديول
import {
  DashboardOverviewService,
  DashboardUsersService,
  DashboardOrdersService,
  DashboardProductsService,
} from './services'; // تعليق: استيراد جميع الخدمات من ملف واحد services

@Module({
  imports: [
    SharedAuthModule,
    userModel,
    OrderModel,
    ProductModel,
  ],
  controllers: [
    DashboardController,
    DashboardUsersController,
    DashboardOrdersController,
    DashboardProductsController,
  ],
  providers: [
    DashboardOverviewService,
    DashboardUsersService,
    DashboardOrdersService,
    DashboardProductsService,
    UserRepository,
    OrderRepository,
    ProductRepository,
  ],
})
export class DashboardModule {}