import { S3Service } from "src/common";
import { BrandRepository, CategoryRepository } from "src/DB";
import { repositoryMock } from "test/mocks/repositories.mock";
import { serviceMock } from "test/mocks/services.mock";
import { CategoryService } from "./category.service";
import { Test } from "@nestjs/testing";

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryRepository, useValue: repositoryMock },
        { provide: BrandRepository, useValue: repositoryMock },
        { provide: S3Service, useValue: serviceMock },
      ],
    }).compile();

    service = module.get(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
