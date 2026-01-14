import { Test } from "@nestjs/testing";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { serviceMock } from "test/mocks/services.mock";
import { repositoryMock } from "test/mocks/repositories.mock";
import { TokenService } from "src/common";
import { TokenRepository } from "src/DB";
import { AuthenticationGuard } from "src/common/Guard/authentication/authentication.guard";
import { Reflector } from "@nestjs/core";

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
