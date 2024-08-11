import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Config, ConfigSettings } from './config';
import * as fs from 'fs';
import { ConfigService } from 'aws-sdk';

async function bootstrap() {
    const appConfig = {};
    const corsConfig = {};

    const config = new ConfigSettings();

    const useTls = config.useTls;
    const useCors = config.useCors;

    //get httpsConfig if using TLS
    if (useTls) {
        appConfig['httpOptions'] = {
            cert: fs.readFileSync(config.certFilePath),
            key: fs.readFileSync(config.keyFilePath),
        };
    }

    //create app
    const app = await NestFactory.create(AppModule, appConfig);

    //use cors if specified
    if (useCors) {
        corsConfig['origin'] = function (origin, callback) {
            callback(null, origin && origin.toLowerCase().trim() == config.allowedCorsOrigin);
        };
        app.enableCors(corsConfig);
    } else {
        console.log('CORS OPTIONS');
        //app.enableCors({ origin: 'http://localhost:8080', methods: 'POST,GET,PUT,HEAD' });
    }

    //basic config
    const cfg = new DocumentBuilder().setTitle('Soundbeats API').setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app, cfg);
    SwaggerModule.setup('docs', app, document);

    //start listening
    await app.listen(config.listenPort);
}
bootstrap();
