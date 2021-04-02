var winston = require('winston');
require('winston-mongodb');
var errorLogEmail =  process.env.ERROR_LOGS_EMAIL
var sendErrorLogOnEmail = process.env.ERROR_LOG_ON_EMAIL || false
var saveLogInDb = process.env.SAVE_ERROR_LOG_IN_DB || false
var saveLogInFile = process.env.SAVE_ERROR_LOG_IN_FILE || false
var mongoDBStr = 'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME;
// var mongoDBStr = 'mongodb://' + process.env.DB_HOST +':'+ process.env.DB_PORT  + '/' + process.env.DB_NAME;
const logger = winston.createLogger({  
    exitOnError: false,  
    defaultMeta: { date: new Date() },
    transports: [
        new winston.transports.Console()
    ]
  });
  if (saveLogInDb == 'true') {
    logger.add(new winston.transports.MongoDB({db:mongoDBStr,collection:'logs'}));
  }
  if (saveLogInFile == 'true') {
    logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  }
  
module.exports = {
  logger:logger,
  errorLogEmail: errorLogEmail,
  sendErrorLogOnEmail: sendErrorLogOnEmail  
};