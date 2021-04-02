const createError = require("http-errors"),
  express = require("express"),
  app = express(),
  path = require("path"),
  logger = require("morgan"),
  server = require('http').createServer(app),
  io = require('socket.io')(server),
  cookieParser = require("cookie-parser"),
  database = require('./configs/database'),
  swagger = require("./configs/swagger"),
  compression = require("compression"),
  i18n = require("i18n"),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  usersRouter = require("./routes/users"),
  indexRouter = require("./routes/index"),
  Util = require('./api/service/util'),
  config = require('./configs/config')

app.use(compression());

global.io = io;
global.Util = Util;
// global.logService = logService;

i18n.configure(config.i18n);
app.use(cors())
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }))
app.use(i18n.init); // Use i18n globally
global.i18n = i18n;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use(swagger);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
