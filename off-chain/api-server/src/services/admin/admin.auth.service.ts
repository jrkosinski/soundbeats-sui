import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { AdminModule, AuthManagerModule, BeatmapsModule, ConfigSettingsModule, ReferralModule } from '../../app.module';
import { AppLogger } from '../../app.logger';
import { IAuthManager } from '../../repositories/auth/IAuthManager';
import { ConfigSettings } from '../../config';
import { IAdminRepo } from '../../repositories/admin/IAdmin';

@Injectable()
export class AdminAuthService {
    network: string;
    logger: AppLogger;
    adminManager: IAdminRepo;
    config: ConfigSettings;
    noncesToWallets: { [key: string]: string };
    private jwtService: JwtService

    constructor(
        @Inject('AdminModule') adminModule: AdminModule,
    ) {
        this.noncesToWallets = {}
        this.adminManager = adminModule.get(this.config);
        const options: JwtModuleOptions = {
            secret: process.env.JWT_SECRET,
        };
        this.jwtService = new JwtService(options);
    }

    async signIn(
        email: string,
        pass: string,
    ): Promise<{ access_token: string }> {
        const user = await this.adminManager.findByEmail(email);

        if (user?.password !== pass) {
            throw new UnauthorizedException();
        }
        const payload = { sub: user.userId, email: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}