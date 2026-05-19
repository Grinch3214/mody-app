import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthRequest {
  headers: { authorization?: string };
  user?: unknown;
}

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = request.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        request.user = this.jwtService.verify(authHeader.slice(7));
      } catch {
        // invalid token: ignore
      }
    }

    return true;
  }
}
