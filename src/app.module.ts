import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { authModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { userModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedAuthModule } from './common/services/modules/auth.module';
import { S3Service } from './common';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { OrderModule } from './modules/order/order.module';
import { RealTimeModule } from './modules/gateway/gateway.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DashboardModule } from './modules/dashboard/dashboard.module'; // تعليق: إضافة موديول لوحة التحكم إلى التطبيق الرئيسي
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(
        `./config/.env.${process.env.NODE_ENV || 'dev'}`,
      ), isGlobal: true,
      // تعليق: جعل ConfigModule متاحاً في جميع الموديولات بدون استيراد إضافي
    }),

    MongooseModule.forRoot(process.env.DB_URI as string), // تعليق: تهيئة اتصال MongoDB من متغير البيئة DB_URI

    SharedAuthModule,
    userModule,
    authModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    CouponModule,
    OrderModule,
    RealTimeModule,
    DashboardModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: process.env.NODE_ENV !== 'production', // تعليق: تفعيل Playground في التطوير فقط لأسباب أمنية
      debug: process.env.NODE_ENV !== 'production', // تعليق: إظهار رسائل أخطاء تفصيلية في بيئة التطوير فقط
      introspection: process.env.NODE_ENV !== 'production', // تعليق: تعطيل introspection في الإنتاج لتقليل كشف مخطط GraphQL
    }),
  ],
  controllers: [AppController],
  providers: [AppService, S3Service,S3Client],
})
export class AppModule {}
