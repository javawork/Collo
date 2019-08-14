//  npm install --save winston
//  npm insatll --save fs
//  npm install --save winston-daily-rotate-file
//  npm install --save date-utils

var winston = require('winston');
require('date-utils');
const fs = require('fs');
const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const tsFormat = () => (new Date()).toLocaleTimeString();

var logger = winston.createLogger({
	format: winston.format.combine (
		winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
	  winston.format.printf(info => `{"timestamp" :\"${info.timestamp}\" , "loglevel":\"${info.level}\", "body":\"${info.message}\"}`)
	),	
    transports: [
/*      new (winston.transports.Console)({
       timestamp: tsFormat,
       colorize: true,
       level: 'info'
      }),*/
      new (require('winston-daily-rotate-file'))({
      	level: 'info',
        filename: `${logDir}/log-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        timestamp: true,
        zippedArchive: true,
        prepend: true,
        maxSize : '50m'
      })
    ]
});


//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
//  logger.error("something ... ");

module.exports = logger;