const appRoot = require('app-root-path');
const winston = require('winston');
const process = require('process');
 
const { combine, timestamp, label, printf } = winston.format;
 
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
 
const options = {
  // log파일
  file: {
    level: 'debug',
    filename: `${appRoot}/logs/auth-jwt.log`,
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    format: combine(
      label({ label: 'auth-jwt' }),
      timestamp(),
      myFormat
    )
  },
  // 개발 시 console에 출력
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: combine(
      label({ label: 'auth-jwt' }),
      timestamp(),
      myFormat
    )
  }
}
 
let logger = new winston.createLogger({
  transports: [
    new winston.transports.File(options.file)
  ],
  exitOnError: false, 
});
 
if(process.env.NODE_ENV !== 'production'){
  logger.add(new winston.transports.Console(options.console))
}
 
module.exports = logger;
