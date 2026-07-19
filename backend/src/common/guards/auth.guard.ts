import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  private isPublic(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  canActivate(context: ExecutionContext) {
    const publicRoute = this.isPublic(context);
    const activate = super.canActivate(context);

    if (!publicRoute) {
      return activate;
    }

    // Rotas públicas: tenta JWT (ex.: crash myBet) sem falhar se ausente
    if (activate instanceof Observable) {
      return activate.pipe(catchError(() => of(true)));
    }

    return Promise.resolve(activate as Promise<boolean>).catch(() => true);
  }

  handleRequest(err, user, _info, context: ExecutionContext) {
    if (this.isPublic(context)) {
      return user || null;
    }
    if (err || !user) {
      throw err || new UnauthorizedException("Invalid or expired token");
    }
    return user;
  }
}
