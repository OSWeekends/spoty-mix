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
    _ = require('lodash'),
    Q = require('q');

var tokens = {};
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
    tokens[profile.id] = accessToken;
    spotifyApi.setAccessToken(accessToken);
    console.log("accesstoken", accessToken)
    var authorizeURL = spotifyApi.createAuthorizeURL(['playlist-modify', 'user-library-modify', 'playlist-read', 'playlist-modify-public', 'playlist-modify-private'], "me_lo_invento");
    console.log(authorizeURL);
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

app.post('/api/users', function(req, res){});


// GET /api/playlists
//   Get the playlists of user for build the mix
app.get('/api/playlists', function(req, res){
    if (!req.user){
        res.status(401).json({err:'Unauthorized', data: ''});
    }else {
        var db = firebase.database();
        var ref = db.ref("users/"+req.user.id+'/playlists');

        // Attach an asynchronous callback to read the data at our posts reference
        ref.once("value", function(snapshot) {
            res.json({err:'', data: snapshot.val()});
        }, function (errorObject) {
            res.json({err:errorObject, data: ''});
        });
    }
});

// PUT /api/playlists/:playlistId
//   Add the playlist of the new temporal list
app.post('/api/playlists', function(req, res){
  if (!req.user && !!req.body.playlists && req.body.playlists.length>0){
    res.status(401).json({err:'Unauthorized', data: ''});
  }else {
    console.log('Get todas las listas');
    spotifyApi.setAccessToken(tokens[req.user.id]);
    getAllPlaylist(req.user.id).then(function(pls){
      console.log('Hola');
      console.log('Llego getAllPlaylist', pls);
      var playlist = _.find(pls, function(pl){
        console.log('HOLAAAAA');
        console.log(pl);
        return pl.name == '🍻 Spoty Mix';
      });

      console.log('Check playlist', playlist);
      if (playlist){
          var playlists = req.body.playlists;
          var tracks = [];
          _.forEach(playlists, function(pl){
            tracks = _.concat(tracks, _.map(pl.tracks, function(track){
              console.log('TRACKSSSSSSS', track);
              return track.uri;
            }))
          });
          console.log('Selecting tracks', tracks);
          tracks = selectRandom(tracks, 50);
          console.log('Selected', tracks.length);
          spotifyApi.setAccessToken(tokens[req.user.id]);
          console.log(req.user.id, playlist.id, tracks);
          spotifyApi.addTracksToPlaylist(req.user.id, playlist.id, tracks)
          .then(function(data) {
            console.log('Added tracks to playlist!');
            res.json({err:'', data:{owner: req.user.id, playlistId:playlist.id}});
          }, function(err) {
            console.log('Something went wrong!', err);
          });
      }else {
        spotifyApi.setAccessToken(tokens[req.user.id]);
        spotifyApi.createPlaylist(req.user.id, '🍻 Spoty Mix')
          .then(function(data) {
            console.log('Created playlist!');
            spotifyApi.setAccessToken(tokens[req.user.id]);

            var playlists = req.body.playlists;
            var tracks = [];
            _.forEach(playlists, function(playlist){
              tracks = _.concat(tracks, _.map(playlist.tracks, function(track){
                return track.uri;
              }))
            });
            tracks = selectRandom(tracks, 50);
            console.log('TRACKS:', tracks.length);
            spotifyApi.setAccessToken(tokens[req.user.id]);
            getAllPlaylist(req.user.id).then(function(pls){
              console.log('listas');
              console.log('listas', pls.length);
              var playlist = _.find(pls, function(pl){
                return pl.name == '🍻 Spoty Mix';
              });
              console.log('CHECKING:',!!playlist)
              if (playlist){
                spotifyApi.setAccessToken(tokens[req.user.id]);
                spotifyApi.addTracksToPlaylist(req.user.id, playlist.id, tracks)
                  .then(function(data) {
                    res.json({err:'', data:{owner: req.user.id, playlistId:playlist.id}});
                    console.log('Added tracks to playlist!');
                  }, function(err) {
                    console.log('Something went wrong!', err);
                  });
              }
            },function(err){
              console.log('Something went wrong! search the list', err);
            });
          }, function(err) {
            console.log('Something went wrong! -NIVEL1', err);
          });
      }
    }, function(err){
      console.log('Something went wrong! -get all playlists', err);
    });
  }
});

// DELETE /api/playlists/:playlistId
//   remove the playlist of the temporal list
app.delete('/api/playlists/:playlistId', function(req, res){});


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

function selectRandom(playlists, limit){
  console.log(!playlists, limit, playlists.length);
    if (!playlists){
        return [];
    }else if (playlists.length == 0){
        return [];
    }else {
        var tracks = [];
        _.forEach(playlists, function(playlist){

            tracks = _.concat(tracks, playlist);
        });

        var selectedTracks = [];
        _.times((tracks.length>=limit)?limit:tracks.length, function(){
            var rand = _.random(0, tracks.length-1);
            console.log(rand,!!tracks[rand], tracks[rand]);
            selectedTracks.push(tracks[rand]);
            tracks.splice(rand, 1);
        });
        return selectedTracks;
    }
}


function getIntersection(tracksA, tracksB, limit){
    limit = limit || 100;
    list = _.intersectionBy(tracksA, tracksB, 'id');
    return selectRandom(list, limit);
}


function writeUserData(id, data) {
  firebase.database().ref('users/' + id ).set(data);

  getAllPlaylist(id, true);
}

function getAllPlaylist(id, save){
  return spotifyApi.getUserPlaylists(id)
  .then(function(playlists) {

    var calls = [];
    for (var i = 0; i < playlists.body.items.length; i++) {
      var p1 = Q.defer();
      var p2 = spotifyApi.getPlaylist(playlists.body.items[i].owner.id, playlists.body.items[i].id);
      var aux = Q.all([p1.promise, p2]);
      calls.push(aux);
      p1.resolve(playlists.body.items[i]);
    };

    return Q.all(calls).then(function(data){
      var res = [];
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
        var pushAux = {
          owner: data[i][0].owner.id,
          id: data[i][0].id,
          name: data[i][0].name,
          total: data[i][1].body.tracks.items.length,
          tracks: tracks
        };
        res.push(pushAux);
        if (save){
          firebase.database().ref('users/' + id + '/playlists').push(pushAux);
        }
      }
      return res;
    });
  },function(err) {
    console.log('Something went wrong!', err);
    return err;
  });
}
