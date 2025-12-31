import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartModel, CartRepository, CategoryModel, CategoryRepository, ProductModel, ProductRepository } from 'src/DB';
import { SharedAuthModule } from 'src/common';
@Module({
  imports:[CategoryModel , ProductModel , CartModel ,SharedAuthModule],
  controllers: [CartController ],
  providers: [CartService, ProductRepository , CategoryRepository , CartRepository],
})
export class CartModule {}
