const logger = require('../config/logger');
const errMsg = require('../error/resError');
const BaseError = require('../error/baseError');
const httpCaller = require('../config/httpCaller');

exports.returnErrorFunction = function (resObject, errorMessageLogger, errorObject) {
  if (errorObject instanceof BaseError) {
    return resObject.status(errorObject.statusCode).json(errMsg(errorObject.errorCode, errorObject.description, errorObject?.errorDetails));
  } else {
    return resObject.status(500).json(errMsg('10000'));
  }
};

exports.verifyTokenMs = async function (req, res, next) {
  try {
    const payload = {
      method: 'POST',
      url: process.env.MS_AUTH_V1_URL + '/auth/verify-token',
      headers: {
        ...req.headers
      }
    }

    const verifyToken = await httpCaller(payload);
    const verifyTokenData = verifyToken?.data
    const verifyTokenHeaders = verifyToken?.headers
    req.id = verifyTokenData.data.id;
    req.parts = verifyTokenData.data.partition;
    req.organitation_id = verifyTokenData.data.organitation_id;
    req.position_id = verifyTokenData.data.position_id;
    req['access-token'] = verifyTokenHeaders['access-token']
    next();
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error verify token...' });
    return res.status(401).json(e?.response?.data);
  }
}