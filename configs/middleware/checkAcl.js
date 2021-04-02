// import Users from ('../models/common/users');
const Users = require('../../api/model/Users');
const AclActions = require('../../api/model/Action')
const AclPermissions = require('../../api/model/Permissions')
/**
 * check-acl
 *
 * A simple policy that allows any request from an authenticated user.
 */
 module.exports = async function (req, res, proceed) {
    if (req.user) {
        if(req.user.role === 'superAdmin'){
            return proceed()
        }
        let method = req.method
        let url = req.path
        Object.values(req.params).forEach(param=>{
            url = url.replace(`${param}`,':'+Object.keys(req.params).find(key => req.params[key] === param))
        })
        if(url.length > 1 && url.endsWith('/')){
            url = url.substring(0,url.length-1)
        }
        // console.log(req.baseUrl, req.path)
        url = req.baseUrl.substr(req.baseUrl.indexOf('/')+1) + url //req.baseUrl.split('/',1)[1] + url
        const user = req.user
        let [action] =  await AclActions.find({method,route:url})
        // console.log(action,method,url)
        if(!action || action === undefined){
            return Util.sendCustomResult(req, res, 'FORBIDDEN', 'USER_NOT_AUTHORISED');
        }
        let actionId = []
        actionId.push((action._id).toString())
        let controllerPermissions =  await AclPermissions.find({permissions: { $in : actionId },role: user.role,controller: action.controller })
        // console.log(controllerPermissions)
        if(controllerPermissions.length){
            return proceed()
        } else {
            if(req.xhr){
                res.set({
                    'Content-Type': 'application/json'
                })
                return Util.sendCustomResult(req, res, 'FORBIDDEN', 'USER_NOT_AUTHORISED');
                // return res.send({
                //     log:'error',
                //     message:'Access denied'
                // })
            } else {
                return Util.sendCustomResult(req, res, 'FORBIDDEN', 'USER_NOT_AUTHORISED');
                // req.flash('error', 'Access denied')
                // return res.redirect('back')
            }
        }
    } else {
        Util.sendCustomResult(req, res, 'SERVER_ERROR', 'INVALID_TOKEN');
    }
    //--•
    // Otherwise, this request did not come from a logged-in user.
    // return res.unauthorized();
    // return Util.sendCustomResult(req, res, 'FORBIDDEN', 'USER_NOT_AUTHORISED');
  
  };
  