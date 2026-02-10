import { Test } from "@nestjs/testing";
import { CategoryController } from "./category.controller";

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CategoryController],
     }).compile();

    controller = module.get(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
