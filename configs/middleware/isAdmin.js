module.exports = (req, res, next) => { 
    if (req.user != undefined && req.user.role == 'admin') {
        next();
    } else {
      commonService.sendCustomResult(req, res, 'FORBIDDEN', 'USER_NOT_AUTHORISED');
    }
}