import { Role } from '@app/common/database';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return this.matchRoles(roles, user.roles);
  }

  matchRoles(roles: string[], userRoles: Role[]): boolean {
    for (const userRole of userRoles) {
      if (roles.includes(userRole.name) || userRole.name == 'ROLE_ADMIN') {
        return true;
      }
    }

    return false;
  }
}
