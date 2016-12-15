var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var login = require('./routers/login.js');
var schedule = require('./routers/schedule.js');
var search = require('./routers/search.js');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var flash    = require('connect-flash');
var tickets = require('./routers/reservations.js');
var cancel = require('./routers/cancelled.js')
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'commons')));
var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port);
});
app.use(express.static('commons'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(cookieParser());
app.use(urlencodedParser);
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 
var setupPassportStrategy = require('./configuration_files/passportConfig.js');
setupPassportStrategy(passport);
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/airlineReservation/signup',signup);
app.use('/airlineReservation/login',login);
app.use('/airlineReservation/schedules',schedule);
app.use('/airlineReservation/search',search);
app.use('/airlineReservation/tickets',tickets);
app.use('/airlineReservation/cancel',cancel);
app.get("/airlineReservation",function(req,res){
	res.render('login',{});
});

 