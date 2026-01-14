import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PaymentService } from 'src/common';
import { CartRepository, CouponRepository, OrderRepository, ProductRepository } from 'src/DB';
import { RealTimeGateway } from '../gateway/gateway';

describe('OrderService', () => {
  let service: OrderService;

  const mockPaymentService = {
    processPayment: jest.fn(),
  };

  const mockOrderRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCartRepository = {
    findByUser: jest.fn(),
    update: jest.fn(),
  };

  const mockCouponRepository = {
    findByCode: jest.fn(),
  };

  const mockProductRepository = {
    findById: jest.fn(),
  };

  const mockRealTimeGateway = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: CouponRepository, useValue: mockCouponRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: RealTimeGateway, useValue: mockRealTimeGateway },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
