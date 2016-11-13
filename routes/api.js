
var express = require('express'),
    SpotifyWebApi = require('spotify-web-api-node'),
    router = express.Router(),
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
router.get('/playlists', function(req, res){});

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

module.exports = router;
