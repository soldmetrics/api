import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.getArgs()[0];
    const location: string = request ? request.url : '';
    const previousPath =
      request && request.headers ? request.headers['x-custom-path'] : '';
    const url = `${previousPath}${location}`;

    return url !== 'auth/validateToken' &&
      (previousPath.startsWith('auth') ||
        previousPath.startsWith('health') ||
        location.includes('tiny/receive-sale'))
      ? true
      : super.canActivate(context);
  }
}
