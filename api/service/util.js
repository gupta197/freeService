const wkhtmltopdf = require("wkhtmltopdf"),
  moment = require("moment"),
  jwt = require("jsonwebtoken"),
  path = require("path"),
  fs = require("fs"),
  config = require('../../configs/config'),
  Email = require('email-templates')

module.exports = {
  codeList: {
    SUCCESS: 200,
    RECORD_CREATED: 201,
    BAD_REQUEST: 400,
    AUTH_ERROR: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INVALID_REQUEST: 405,
    BLOCKED_CONTENT: 410,
    RECORD_ALREADY_EXISTS: 409,
    SERVER_ERROR: 500,
  },
  sendCustomResult: (req, res, status_code, message, data) => {
    var result = {
      status: {
        code: module.exports.codeList[status_code],
        message: i18n.__(message),
      },
    };
    if (typeof data !== "undefined") {
      result.data = data;
    } else {
      result.data = {};
    }
    return res.json(result);
  },
  paginateData: (data) => {
    return (result = {
      records: data.docs,
      page: data.page,
      total_pages: data.totalPages,
      page_records: data.docs.length,
      total_records: data.totalDocs,
    });
  },
  jwtIssue: (payload, tokenSecret, expiryTime) => {
    return jwt.sign(
      payload,
      tokenSecret, // Token Secret that we sign it with
      {
        expiresIn: expiryTime // Token Expire time 
      }
    );
  },
  jwtVerify: (token, tokenSecret, callback) => {
    return jwt.verify(
      token, // The token to be verified
      tokenSecret, // Same token we used to sign
      {}, // No Option, 
      callback //Pass errors or decoded token to callback
    );
  },
  jwtDecode: (token) => {
    return jwt.decode(token);
  },
  sendEmail: async (templateName, toEmail, subject, data) => {
    let transporter = nodemailer.createTransport(config.mailerSettings);
    let dateFormat = "Do MMMM YYYY";
    let timeFormat = 'dddd HH:mm:ss';
    const email = new Email({
      message: {
        from: config.fromEmail
      },
      preview: false,
      send: true,
      transport: transporter,
      views: {
        options: {
          extension: 'ejs'
        }
      }
    });
    data.assets_url = config.assetsPublicUrl // Assets url for images in all emails
    data.moment = moment;
    if (data.first_name != undefined && data.first_name) {
      data.first_name = data.first_name;
    }
    email.send({
      template: templateName,
      message: {
        to: toEmail
      },
      locals: {
        subject: subject,
        data: data,
        moment: moment,
        dateFormat: dateFormat,
        timeFormat:timeFormat
      }
    }).then((result) => {
      console.log('Email subject: ', subject, ' Sent to: ', toEmail);
    }).catch((error) => {
    //   console.log('error', error);
    console.log("error",error)
    });
  },
  deleteFile: (filePath) => {
    try {
      return fs.unlinkSync(filePath);
    } catch (error) {
    //   console.log('error', error);
      return false;
    }
  },
  csvDownload: (req, res, fileName, fields, data) => {
    let opts = { fields };
    try {
      let parser = new Parser(opts);
      let csv = parser.parse(data);
      res.header('Content-Type', 'text/csv');
      res.attachment(fileName);
      return res.send(csv);
    } catch (err) {
    //   console.log('error', err);
      Util.sendCustomResult(req, res, 'SERVER_ERROR', 'COULD_NOT_EXPORT');
    }
  },

  pdfDownload: (req, res, fileName, dir, html) => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      var wkhOptions = {
        output: dir + '/' + fileName,
        pageSize: 'A4',
        encoding: 'utf-8',
        orientation: 'landscape'
      };

      wkhtmltopdf(html, wkhOptions, function (err, stream) {
     
        var stream = fs.createReadStream(dir + '/' + fileName);
        stream.pipe(res.attachment(fileName));
        var had_error = false;
        stream.on('error', function (err) {
          had_error = true;
        //   console.log('error', err);
          Util.sendCustomResult(req, res, 'SERVER_ERROR', 'COULD_NOT_EXPORT');
        });
        stream.on('close', function () {
          if (!had_error) {
            fs.unlink(dir + '/' + fileName, function (err) {
              if (err) {
                console.log('error', err);
                Util.sendCustomResult(req, res, 'SERVER_ERROR', 'COULD_NOT_EXPORT');
              }
            });
          }
        });
      });
    } catch (err) {
      console.log('error', err);
      Util.sendCustomResult(req, res, 'SERVER_ERROR', 'COULD_NOT_EXPORT');
    }
  },
  copyFile: async (source, destination) => {
    try {
      if (fs.existsSync(source)) {
        if (!fs.existsSync(path.dirname(path.dirname(destination)))) { // if parent destination directory not exists then create new
          fs.mkdirSync(path.dirname(path.dirname(destination)),{recursive: true})
          if (!fs.existsSync(path.dirname(destination))) {               // if destination directory not exists then create new
            fs.mkdirSync(path.dirname(destination),{recursive: true})
          }
        } else {
          if (!fs.existsSync(path.dirname(destination))) {
            fs.mkdirSync(path.dirname(destination),{recursive: true})  // if parent directory exists but destination directory not exists then create new
          }
        }
        fs.createReadStream(source).pipe(fs.createWriteStream(destination));
        return true;
      }
    } catch (error) {
      console.log('error', error);
      return false;
    }
  },
};
