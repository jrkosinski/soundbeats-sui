import { Logger, Injectable } from '@nestjs/common';
import * as fs from 'fs';

/**
 * Logs app info, alerts, warnings, and errors to a file destination.
 */
@Injectable()
export class AppLogger extends Logger {
    private writeStream = null;

    constructor(context: string) {
        super(context);
        this._checkCreateLogFile();
    }

    log(message: string) {
        this._checkCreateLogFile();
        super.log(message);
        this._writeEntry('INFO', message);
    }

    error(message: string, trace?: string) {
        this._checkCreateLogFile();
        super.error(message, trace);
        this._writeEntry('ERROR', `${message} ${trace || ''}`);
    }

    warn(message: string, context?: string) {
        this._checkCreateLogFile();
        super.warn(message, context);
        this._writeEntry('WARN', `${message} ${context || ''}`);
    }

    debug(message: string, context?: string) {
        this._checkCreateLogFile();
        super.debug(message, context);
        this._writeEntry('DEBUG', `${message} ${context || ''}`);
    }

    _writeEntry(tag, message) {
        this.writeStream.write(
            `[${tag}][${new Date(Date.now())
                .toTimeString()
                .replace(' (Coordinated Universal Time)', '')}] ${message}\n`,
        );
    }

    _checkCreateLogFile() {
        const filename = this._getLogFileName();
        if (!fs.existsSync(filename)) {
            console.log('creating file');
            fs.writeFileSync(filename, '\n');
        }
        this.writeStream = fs.createWriteStream(filename, {
            flags: 'a',
        });
    }

    _getLogFileName() {
        const dt = new Date();
        const filename = `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}.log`;
        return `./logs/${filename}`;
    }
}
