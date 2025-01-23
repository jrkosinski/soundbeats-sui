import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Res,
} from '@nestjs/common';
import { AdminAuthService } from '../../services/admin/admin.auth.service';

@Controller('admin/login')
export class AdminAuthController {
    constructor(
        private adminAuthService: AdminAuthService,
    ) {}
    @Get('/')
    login_view(@Res() res) {
        return res.render('login', { layout: 'login_layout', message: 'Hello World' });
    }


    @HttpCode(HttpStatus.OK)
    @Post('/')
    async signIn(@Body() signInDto: Record<string, any>, @Res() res) {

        try {
            let result = await this.adminAuthService.signIn(signInDto.email, signInDto.password);
            res.send({redirect: '/admin', access_token: result.access_token});
        }catch (e) {
            return e
        }

    }
}
