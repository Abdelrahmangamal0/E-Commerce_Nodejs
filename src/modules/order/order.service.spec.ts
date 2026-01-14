import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';

import {
  OrderRepository,
  CartRepository,
  CouponRepository,
  ProductRepository,
} from 'src/DB';

import { repositoryMock } from 'test/mocks/repositories.mock';
import { serviceMock } from 'test/mocks/services.mock';
import { gatewayMock } from 'test/mocks/providers.mock';
import { PaymentService } from 'src/common';
import { RealTimeGateway } from '../gateway/gateway';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,

        { provide: OrderRepository, useValue: repositoryMock },
        { provide: CartRepository, useValue: repositoryMock },
        { provide: CouponRepository, useValue: repositoryMock },
        { provide: ProductRepository, useValue: repositoryMock },

        { provide: PaymentService, useValue: serviceMock },
        { provide: RealTimeGateway, useValue: gatewayMock },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
