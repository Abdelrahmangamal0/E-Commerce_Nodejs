import { Test } from '@nestjs/testing';
import { ProductService } from './product.service';
import { AppModule } from 'src/app.module';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
     imports:[AppModule]
    }).compile();

    service = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
