import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { CouponRepository } from 'src/DB';
import { repositoryMock } from 'test/mocks/repositories.mock';

describe('CouponService', () => {
  let service: CouponService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: CouponRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
