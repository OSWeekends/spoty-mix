var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    SpotifyStrategy = require('passport-spotify').Strategy,
    firebase = require('firebase'),
    config = require('./config'),
    engine = require('express-dot-engine'),
    loginController = require('./controllers/login');

var tokens = {};

firebase.initializeApp(config.firebase);

var app = express();

// configure Express
app.engine('html', engine.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
  if(req.user){
    tokens[req.user.id] = req.user.accessToken;
    loginController.doLogin(req.user.id, req.user._json, req.user.accessToken);
    res.redirect('/index');
  }else {
    res.render('login');
  }
});

app.get('/index', function(req, res){
  if (req.isAuthenticated()) { res.render('index'); }
  else{
    res.redirect('/');
  }
});

app.get('/templates/home', function(req, res){
  res.render('templates/home');
});
app.get('/templates/mix', function(req, res){
  res.render('templates/mix');
});
app.get('/templates/playlist', function(req, res){
  res.render('templates/playlist');
});

// Middleware to load the tokens of spotify in the request for api
app.use('/api/**', function(req, res, next){
  req.tokens = tokens;
  next();
});

var apiRuter = require('./routes/api');
app.use('/api', apiRuter);

app.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['playlist-modify', 'user-library-modify', 'playlist-read', 'playlist-modify-public', 'playlist-modify-private'], showDialog: true}),
  function(req, res){
});

app.get('/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

var port = 8080;

app.listen(port);

console.log('Listening on', port);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
