var express = require('express');
var router = express.Router();

const isAuthorized = require("../configs/middleware/isAuthorized");
const acl = require("../configs/middleware/checkAcl");
const isAdmin = require("../configs/middleware/isAdmin");
// const isSuperAdmin = require("../middlewares/isSuperAdmin");
const isAdminOrSuperAdmin = require("../configs/middleware/isAdminOrSuperAdmin");
const accepted_extensions = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "text/csv",
];
var multer = require("multer");
var fs = require("fs");
var randomstring = require("randomstring");
var config = require("../configs/config");
var storage = multer.diskStorage({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB upload limit
  },
  destination: function (req, file, cb) {
    if (accepted_extensions.indexOf(file.mimetype) > -1) {
      var path = config.userAssetsUrl;
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      cb(null, path);
    } else {
      return cb(new Error("Invalid image format"));
    }
  },
  filename: function (req, file, cb) {
    var extension = file.originalname.split(".").pop();
    // generating unique filename with extension
    var uuid = randomstring.generate(10) + "_" + Date.now() + "." + extension;
    cb(null, uuid);
  },
});

var upload = multer({ storage: storage });

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
