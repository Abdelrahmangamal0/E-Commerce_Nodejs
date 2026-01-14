import { Reflector } from '@nestjs/core';
import { AuthorizationGuard } from './authorization.guard';
import { roleEnum } from 'src/common/enums';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AuthorizationGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow user with correct role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([roleEnum.User]);

    const mockContext: any = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          credentials: { user: { role: roleEnum.User } },
        }),
      }),
      getHandler: jest.fn(),
    };

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should deny user with wrong role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([roleEnum.Admin]);

    const mockContext: any = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          credentials: { user: { role: roleEnum.User } },
        }),
      }),
      getHandler: jest.fn(),
    };

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(false);
  });
});
