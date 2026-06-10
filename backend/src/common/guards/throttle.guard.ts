import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Throttle } from '@nestjs/throttler';

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const throttleOptions = this.reflector.get('throttle', context.getHandler());
    
    if (!throttleOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    
    // Rate limiting logic would be implemented here
    // For now, we'll rely on the @Throttle decorator
    
    return true;
  }
}
