import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Types } from 'mongoose';

describe('CartController', () => {
  let cartController: CartController;
  let cartService: CartService;

  const mockUser = { _id: new Types.ObjectId(), name: 'Test User' } as any;
  const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

  const createCartDto = { productId: new Types.ObjectId(), quantity: 2 };
  const removeItemsDto = { productIds: [new Types.ObjectId()] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            create: jest.fn(),
            removeItem: jest.fn(),
            getCart: jest.fn(),
          },
        },
      ],
    }).compile();

    cartController = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(cartController).toBeDefined();
    expect(cartService).toBeDefined();
  });

  it('should call addItem', async () => {
    await cartController.create(mockUser, createCartDto, mockRes);
    expect(cartService.create).toHaveBeenCalledWith(mockUser, createCartDto);
  });

  it('should call removeItem', async () => {
    await cartController.removeFromCart(mockUser, removeItemsDto);
    expect(cartService.removeFromCart).toHaveBeenCalledWith(mockUser, removeItemsDto);
  });

  it('should call getCart', async () => {
    await cartController.findOne(mockUser);
    expect(cartService.findOne).toHaveBeenCalledWith(mockUser);
  });
});
