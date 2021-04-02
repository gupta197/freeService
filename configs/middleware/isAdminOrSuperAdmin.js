module.exports = async function (req, res, proceed) {
    if (!req.user) {
      return commonService.sendCustomResult(req, res, 'SERVER_ERROR', 'INVALID_TOKEN');
    }
    console.log(req.user)
    if (!(req.user.role == 'superAdmin' || req.user.role == 'admin' )) {
    return commonService.sendCustomResult(req, res, 'FORBIDDEN', 'USER_NOT_AUTHORISED');
    }
    return proceed();
  
  };