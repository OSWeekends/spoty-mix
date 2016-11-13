
var express = require('express'),
    router = express.Router(),
    firebase = require('firebase'),
    SpotifyWebApi = require('spotify-web-api-node'),
    _ = require('lodash'),
    config = require('../config');

var spotifyApi = new SpotifyWebApi({
  clientId : config.spotify.clientID,
  clientSecret : config.spotify.clientSecret,
  redirectUri : 'http://www.localhost.8080/callback'
});

spotifyApi.setAccessToken(config.spotify.token || undefined);
console.log("token", config.spotify.token || undefined)

/* /api */


// POST /api/users
//   Send the name of the user to search in the body of the request and return the playlist
//   in commons with the user
router.post('/users', function(req, res){});


// GET /api/playlists
//   Get the playlists of user for build the mix
router.get('/playlists', function(req, res){
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
router.post('/playlists/:songList', function(req, res){
  console.log(req.user)
  spotifyApi.createPlaylist('kom256', ':beers: Spoty Mix', { 'public' : false })
  .then(function(data) {
    console.log('Created playlist!');
  }, function(err) {
    console.log('Something went wrong!', err);
  });

/*
  // Add tracks to a playlist
  spotifyApi.addTracksToPlaylist('thelinmichael', '5ieJqeLJjjI8iJWaxeBLuK', ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"])
  .then(function(data) {
    console.log('Added tracks to playlist!');
  }, function(err) {
    console.log('Something went wrong!', err);
  });
*/
});

// DELETE /api/playlists/:playlistId
//   remove the playlist of the temporal list
router.delete('/playlists/:playlistId', function(req, res){});


function selectRandom(playlists){
    if (!playlist){
        return [];
    }else if (playlist.length == 0){
        return [];
    }else {
        var tracks = [];
        _.forEach(playlists, function(playlist){
            tracks = _.concat(tracks, playlist.tracks);
        });

        var selectedTracks = [];
        _.times((tracks.length>=100)?100:tracks.length, function(){
            var rand = _.random(0, tracks.length-1);
            selectedTracks.push(tracks[rand]);
            tarcks.splice(rand, 1);
        });
        return selectedTracks;
    }
}

module.exports = router;
