import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminModule } from '../../app.module';

@Injectable()
export class AdminService {
    constructor(
        private usersService: AdminService,
        private jwtService: JwtService,
        @Inject('AdminModule') adminModule: AdminModule,
    ) {}

}