const logger = require('../config/logger');
const errMsg = require('../error/resError');

exports.returnErrorFunction = function (resObject, errorMessageLogger, errorObject) {
  if (typeof errorObject === 'string') {
    return resObject.status(400).json(errMsg(errorObject));
  } else if (errorObject.error) {
    return resObject.status(500).json(errorObject.error);
  } else {
    return resObject.status(500).json(errMsg('10000'));
  }
};