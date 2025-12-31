import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemsFromCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { Auth, IResponse, roleEnum, User } from 'src/common';
import type { userDocument } from 'src/DB';
import type{Response} from 'express'
import { successResponse } from 'src/common/utils/response';
import { CartResponse } from './entities/cart.entity';


@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true})) 
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
 
  @Auth([roleEnum.User])
  @Post()
 async create(
    @User() user:userDocument,
    @Body() createCartDto: CreateCartDto,
    @Res({passthrough:true}) res:Response
 
  ):Promise<IResponse<CartResponse>> {
    const {status ,cart} = await this.cartService.create(createCartDto, user);
    res.status(status)

  return successResponse<CartResponse>({data:{cart}})
  }
 
  @Auth([roleEnum.User])
  @Patch()
  async removeFromCart(
    @User() user:userDocument,
    @Body() removeItemsFromCartDto: RemoveItemsFromCartDto,
 
  ):Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.removeFromCart(removeItemsFromCartDto, user);

  return successResponse<CartResponse>({data:{cart}})
  }
  
  @Auth([roleEnum.User])
  @Delete()
  async remove(
    @User() user:userDocument,
    
  ):Promise<IResponse> {
    await this.cartService.remove(user);

  return successResponse()
  }
  @Auth([roleEnum.User])
  @Get()
  async findOne(
    @User() user:userDocument,
    
  ):Promise<IResponse<CartResponse>> {
   const cart = await this.cartService.findOne(user);

   return successResponse<CartResponse>({data:{cart}})
  }



 
  }
