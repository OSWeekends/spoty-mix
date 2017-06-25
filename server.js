const express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    engine = require('express-dot-engine'),
    expressJwt = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    config = require('./config/config'),
    passport = require('passport'),
    loginController = require('./controllers/login');

mongoose.connect(config.mongo.url);

var app = express();

// configure Express
app.engine('html', engine.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: config.express.secret }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

// We are going to protect /api routes with JWT
app.use('/api', expressJwt({
    secret: config.express.secret
}));

app.use('**', function(req, res, next) {
    req.secret = config.express.secret;
    next();
});

var templatesRouter = require('./routes/templates');
var rootRouter = require('./routes/root');
var apiRuter = require('./routes/api');

app.use('/templates', templatesRouter);
app.use('/api', apiRuter);
app.use('/', rootRouter);

app.listen(config.express.port);

console.log('Listening on', config.express.port);