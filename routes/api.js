
var express = require('express');
var router = express.Router();

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
router.put('/playlists/:playlistId', function(req, res){});

// DELETE /api/playlists/:playlistId
//   remove the playlist of the temporal list
router.delete('/playlists/:playlistId', function(req, res){});

module.exports = router;