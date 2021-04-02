var config = require('../configs/config');
const Users = require('../../api/model/Users');
module.exports = async (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['token'] || req.headers['authorization'];
  if (token) {
    var parts = token.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        Util.jwtVerify(credentials, config.jwtTokenSecret, async (err, result) => {
          if (err) {
            logService.log('error', err);
            return Util.sendCustomResult(req, res, 'AUTH_ERROR', 'TOKEN_EXPIRED');
          }
          var isUserActive = await Users.findOne({ _id: result.id, status: 1 });
          if (isUserActive) {
            req.user = result; // This is the decrypted token or the payload you provided
            req.user_details = isUserActive;
            next();
          } else {
            return Util.sendCustomResult(req, res, 'AUTH_ERROR', 'ADMIN_BLOCKED_USER_ACCOUNT');
          }

        });
      } else {
        Util.sendCustomResult(req, res, 'SERVER_ERROR', 'INVALID_TOKEN');
      }
    } else {
      Util.sendCustomResult(req, res, 'SERVER_ERROR', 'INVALID_TOKEN');
    }
  } else {
    next();
  }
}