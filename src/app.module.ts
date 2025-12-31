import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { authModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { join, resolve } from 'path';
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
import { CacheModule } from '@nestjs/cache-manager';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
@Module({
  
  imports: [
    
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.dev'),
      isGlobal: true
    }),
    // CacheModule.register({
    //   isGlobal: true,
    //   ttl:5000
    // }),
   
    
           MongooseModule.forRoot(process.env.DB_URI as string),
           SharedAuthModule ,
           userModule,
           authModule,
           BrandModule,
           CategoryModule,
           ProductModule,
           CartModule,
           CouponModule,
           OrderModule,
    RealTimeModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    
       
  ],
  controllers: [AppController],
  providers: [AppService , S3Service],
})
export class AppModule {}
