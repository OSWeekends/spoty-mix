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
    SpotifyWebApi = require('spotify-web-api-node'),
    Q = require('q');

var appKey = config.spotify.clientID;
var appSecret = config.spotify.clientSecret;

var spotifyApi = new SpotifyWebApi({
  clientId : config.spotify.clientID,
  clientSecret : config.spotify.clientSecret,
  redirectUri : 'http://www.localhost.8080/callback'
});


firebase.initializeApp(config.firebase);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new SpotifyStrategy({
  clientID: appKey,
  clientSecret: appSecret,
  callbackURL: 'http://localhost:8080/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    config.spotify.token = accessToken;
    spotifyApi.setAccessToken(accessToken);
    process.nextTick(function () {
      return done(null, profile);
    });
  }));

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
    writeUserData(req.user.id, req.user._json)
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

// Routes for api service
var routesApi = require('./routes/api');
app.use('/api', routesApi);

app.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'], showDialog: true}),
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

function writeUserData(id, data) {
  firebase.database().ref('users/' + id ).set(data);

  spotifyApi.getUserPlaylists(id)
  .then(function(playlists) {

    var calls = [];
    for (var i = 0; i < playlists.body.items.length; i++) {
      var p1 = Q.defer();
      var p2 = spotifyApi.getPlaylist(playlists.body.items[i].owner.id, playlists.body.items[i].id);
      var aux = Q.all([p1.promise, p2]);
      calls.push(aux);
      p1.resolve(playlists.body.items[i]);
    };

    Q.all(calls).then(function(data){
      for (var i = 0; i< data.length;i++){
        var tracks = [];

        for (var j=0; j<data[i][1].body.tracks.items.length; j++){
          var aux = data[i][1].body.tracks.items[j].track;
          tracks.push({
            duration_ms: aux.duration_ms,
            explicit: aux.explicit,
            external_urls: aux.external_urls,
            href: aux.href,
            id: aux.id,
            name: aux.name,
            popularity: aux.popularity,
            preview_url: aux.preview_url,
            uri: aux.uri
          });
        }
        firebase.database().ref('users/' + id + '/playlists').push({
          owner: data[i][0].owner.id,
          id: data[i][0].id,
          name: data[i][0].name,
          total: data[i][1].body.tracks.items.length,
          tracks: tracks
        })
      }
    });

  },function(err) {
    console.log('Something went wrong!', err);
  });
}
