const logger = require('../config/logger');
const errMsg = require('../error/resError');

exports.returnErrorFunction = function (resObject, errorMessageLogger, errorObject) {
  if (typeof errorObject === 'string') {
    logger.error(errorMessageLogger, errorObject);
    return resObject.status(400).json(errMsg(errorObject));
  } else if (errorObject.error) {
    logger.error(errorObject.error.err_code, errorObject);
    return resObject.status(500).json(errorObject.error);
  } else {
    logger.error(errorObject);
    return resObject.status(500).json(errMsg('10000'));
  }
};