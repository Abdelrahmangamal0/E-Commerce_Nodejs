import { Test } from '@nestjs/testing';
import { AuthenticationGuard } from './authentication.guard';
import { Reflector } from '@nestjs/core';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthenticationGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: 'TokenService', useValue: {} },
        { provide: 'TokenRepository', useValue: {} },
      ],
    }).compile();

    guard = module.get(AuthenticationGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
