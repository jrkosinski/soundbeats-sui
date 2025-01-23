import { ApiProperty } from '@nestjs/swagger';


export class CreateAdminDto {
    @ApiProperty({ description: 'Name of Admin' })
    email: string;
}

export class UpdateRewardDto {
    readonly type?: string;
    readonly reward?: string;
    readonly interval?: any[];
    readonly param?: any[];
}
