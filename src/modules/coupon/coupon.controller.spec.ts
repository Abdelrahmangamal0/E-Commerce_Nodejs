import { Test, TestingModule } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';

describe('CouponController', () => {
  let controller: CouponController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        { provide: CouponService, useValue: {} },

        // Mock guard
        {
          provide: APP_GUARD,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    }).compile();

    controller = module.get<CouponController>(CouponController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
