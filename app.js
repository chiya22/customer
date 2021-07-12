var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var security = require('./util/security');
var flash = require("connect-flash");

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin/admin');
var usersRouter = require('./routes/admin/users');
var roomsRouter = require('./routes/admin/rooms');
var bicyclesRouter = require('./routes/admin/bicycles');
var carsRouter = require('./routes/admin/cars');
var cabinetsRouter = require('./routes/admin/cabinets');
var nyukyosRouter = require('./routes/admin/nyukyos');
var telnosRouter = require('./routes/admin/telnos');
var companyRouter = require('./routes/company');
var personRouter = require('./routes/person');
var outaisRouter = require('./routes/outai');
var riyoushaRouter = require('./routes/riyousha');
var outaiskaigiRouter = require('./routes/outaikaigi');
// var topRouter = require('./routes/top');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//セッションの有効化
var session = require('express-session');
app.use(session({
  secret: "auth-secret",
  resave: false,
  saveUninitialized: true,
  name: "sid",
  cookie: {
    maxAge: 3 * 24 * 60 * 60 * 1000,
    secure: false
  }
}));

//認証の初期化
app.use(...security.initialize());
app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(__dirname + '/public'));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/admin/users', usersRouter);
app.use('/admin/rooms', roomsRouter);
app.use('/admin/bicycles', bicyclesRouter);
app.use('/admin/cars', carsRouter);
app.use('/admin/cabinets', cabinetsRouter);
app.use('/admin/nyukyos', nyukyosRouter);
app.use('/admin/telnos', telnosRouter);
app.use('/company', companyRouter);
app.use('/person', personRouter);
app.use('/outai', outaisRouter);

app.use('/riyousha', riyoushaRouter);
app.use('/outaikaigi', outaiskaigiRouter);
// app.use('/top', topRouter);

const cron = require('./util/cron')
cron.startcron();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
