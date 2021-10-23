import winston from 'winston';

const logFormatter = winston.format.printf(({ level, message, timestamp }) => {
  return `${new Date(timestamp).toLocaleDateString('en-GB', {timeZone: 'UTC'})} ${new Date(timestamp).toLocaleTimeString('en-GB', {timeZone: 'UTC'})} ${level.replace('info', 'I').replace('warn', '!').replace('error', '!!')}: ${message}`;
});

winston.addColors({
  error: 'red',
  debug: 'blue',
  warn: 'yellow',
  http: 'gray',
  info: 'blue',
  verbose: 'cyan',
  silly: 'magenta'
});

export const logger = winston.createLogger({
	level: 'debug',
	format: winston.format.combine(
		winston.format.simple()
	),
	transports: [
		new winston.transports.File({filename: 'deemix-web-fe-error.log', level: 'warn'}),
		new winston.transports.File({filename: 'deemix-web-fe.log'}),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        logFormatter
      )
    })
	]
});