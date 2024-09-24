import { BadRequestException, UnauthorizedException, NotFoundException, InternalServerErrorException } from "@nestjs/common";


//TODO: REPEATED CODE
export function returnError(apiCall: string, errorCode: number, message: any) {
    this.logger.error(`${apiCall} returning ${errorCode}: ${message}`);
    switch (errorCode) {
        case 400:
            throw new BadRequestException(message);
        case 401:
            throw new UnauthorizedException(message);
        case 404:
            throw new NotFoundException(message);
        case 500:
            throw new InternalServerErrorException(message);
    }

    throw new BadRequestException(message);
}