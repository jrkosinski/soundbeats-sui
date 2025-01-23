import {
    CanActivate,
    ExecutionContext,
    mixin,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


export const GuestGuard  = (role: string) => {
    class GuestGuardMixin implements CanActivate {
        public jwtService: JwtService

        async canActivate(context: ExecutionContext) {
            const request = context.switchToHttp().getRequest();
            const token = request.cookies?.jwt;

            if (token && role === 'only-guest') {
                return false
            }

            return true;
        }
    }

    const guard = mixin(GuestGuardMixin);
    return guard;
}







