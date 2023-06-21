import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const { user } = context.switchToHttp().getRequest();

    return user.isEmailVerified;
  }
}
