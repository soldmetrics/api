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
    const authenticatedUrls = [
      'auth/validateToken',
      'auth/me',
      'auth/set-integration',
      'auth/register-device',
      'billing/',
    ];

    return !authenticatedUrls.includes(url) &&
      (previousPath.startsWith('auth') ||
        previousPath.startsWith('health') ||
        url.includes('sales/receive-sale') ||
        url.includes('billing/webhook') ||
        url.includes('billing/redirect'))
      ? true
      : super.canActivate(context);
  }
}
