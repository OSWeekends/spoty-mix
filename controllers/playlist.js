var firebase = require('firebase');
var SpotifyWebApi = require('spotify-web-api-node');
var config = require('../config');
var spotifyApi = new SpotifyWebApi({
  clientId : config.spotify.clientID,
  clientSecret : config.spotify.clientSecret,
  redirectUri : 'http://www.localhost.8080/callback'
});

var _ = require('lodash');
var Q = require('q');

var Playlists = module.exports;

module.exports.writeUserData = function(id, data, token) {
  firebase.database().ref('users/' + id ).set(data);

  getAllPlaylist(id, true, token);
}

module.exports.findAllPlaylists = function(req, res){
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
};

module.exports.mergePlaylists = function(req, res){
  if (!req.user && !!req.body.playlists && req.body.playlists.length>0){
    res.status(401).json({err:'Unauthorized', data: ''});
  }else {
    getAllPlaylist(req.user.id, false, req.tokens[req.user.id]).then(function(pls){
      var playlist = _.find(pls, function(pl){
        return pl.name == '🍻 Spoty Mix';
      });

      if (playlist){
          var playlists = req.body.playlists;
          var tracks = [];
          _.forEach(playlists, function(pl){
            tracks = _.concat(tracks, _.map(pl.tracks, function(track){
              return track.uri;
            }))
          });
          tracks = selectRandom(tracks, 50);
          spotifyApi.setAccessToken(req.tokens[req.user.id]);
          spotifyApi.addTracksToPlaylist(req.user.id, playlist.id, tracks)
          .then(function(data) {
            console.log('Added tracks to playlist!');
            res.json({err:'', data:{owner: req.user.id, playlistId:playlist.id}});
          }, function(err) {
            console.log('Something went wrong!', err);
          });
      }else {
        spotifyApi.setAccessToken(req.tokens[req.user.id]);
        spotifyApi.createPlaylist(req.user.id, '🍻 Spoty Mix')
          .then(function(data) {
            spotifyApi.setAccessToken(req.tokens[req.user.id]);

            var playlists = req.body.playlists;
            var tracks = [];
            _.forEach(playlists, function(playlist){
              tracks = _.concat(tracks, _.map(playlist.tracks, function(track){
                return track.uri;
              }))
            });
            tracks = selectRandom(tracks, 50);
            spotifyApi.setAccessToken(req.tokens[req.user.id]);
            getAllPlaylist(req.user.id, false, req.tokens[req.user.id]).then(function(pls){
              var playlist = _.find(pls, function(pl){
                return pl.name == '🍻 Spoty Mix';
              });
              if (playlist){
                spotifyApi.setAccessToken(req.tokens[req.user.id]);
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
}

function getIntersection(tracksA, tracksB, limit){
    limit = limit || 100;
    list = _.intersectionBy(tracksA, tracksB, 'id');
    return selectRandom(list, limit);
}

function getAllPlaylist(id, save, token){
    spotifyApi.setAccessToken(token);
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
            selectedTracks.push(tracks[rand]);
            tracks.splice(rand, 1);
        });
        return selectedTracks;
    }
}