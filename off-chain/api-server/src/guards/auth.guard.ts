import {
    CanActivate,
    ExecutionContext,
    mixin,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


export const AuthGuard  = (role: string) => {
    class AuthGuardMixin implements CanActivate {
        public jwtService: JwtService

        async canActivate(context: ExecutionContext) {
            const request = context.switchToHttp().getRequest();
            const token = request.cookies?.jwt;


            if (!token && role === 'only-auth') {
                throw new UnauthorizedException();
            }

            try {
                const payload = await this.jwtService.verifyAsync(
                    token,
                    {
                        secret: process.env.JWT_SECRET,
                    }
                );

                request['user'] = payload;
            } catch {
                throw new UnauthorizedException();
            }
            return true;
        }
    }

    const guard = mixin(AuthGuardMixin);
    return guard;
}







