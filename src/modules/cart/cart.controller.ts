import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import {type Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemsFromCartDto } from './dto/update-cart.dto';
import { CartResponse } from './entities/cart.entity';
import { Auth, IResponse, roleEnum, User } from 'src/common';
import type { userDocument } from 'src/DB';
import { successResponse } from 'src/common/utils/response';

@ApiTags('Cart')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ========================= CREATE CART / ADD ITEMS =========================
  @Auth([roleEnum.User])
  @Post()
  @ApiOperation({
    summary: 'Add items to cart',
    description: 'Create or add items to the user\'s cart',
  })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({
    status: 201,
    description: 'Items added to cart successfully',
    type: CartResponse,
  })
  async create(
    @User() user: userDocument,
    @Body() createCartDto: CreateCartDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IResponse<CartResponse>> {
    const { status, cart } = await this.cartService.create(createCartDto, user);
    res.status(status);
    return successResponse<CartResponse>({ data: { cart } });
  }

  // ========================= REMOVE ITEMS FROM CART =========================
  @Auth([roleEnum.User])
  @Patch()
  @ApiOperation({
    summary: 'Remove items from cart',
    description: 'Remove specific items from the user\'s cart',
  })
  @ApiBody({ type: RemoveItemsFromCartDto })
  @ApiResponse({
    status: 200,
    description: 'Items removed from cart successfully',
    type: CartResponse,
  })
  async removeFromCart(
    @User() user: userDocument,
    @Body() removeItemsFromCartDto: RemoveItemsFromCartDto,
  ): Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.removeFromCart(removeItemsFromCartDto, user);
    return successResponse<CartResponse>({ data: { cart } });
  }

  // ========================= CLEAR CART =========================
  @Auth([roleEnum.User])
  @Delete()
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Remove all items from the user\'s cart',
  })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async remove(@User() user: userDocument): Promise<IResponse> {
    await this.cartService.remove(user);
    return successResponse();
  }

  // ========================= GET USER CART =========================
  @Auth([roleEnum.User])
  @Get()
  @ApiOperation({
    summary: 'Get user cart',
    description: 'Retrieve current items in the user\'s cart',
  })
  @ApiResponse({
    status: 200,
    description: 'User cart retrieved successfully',
    type: CartResponse,
  })
  async findOne(@User() user: userDocument): Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.findOne(user);
    return successResponse<CartResponse>({ data: { cart } });
  }
}
