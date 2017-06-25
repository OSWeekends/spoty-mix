var express = require('express');
var router = express.Router();
var playlistController = require('../controllers/playlist');

// Routes for /api
router.post('/users', function(req, res) {});

// GET /api/playlists
//   Get the playlists of user for build the mix
router.get('/playlists', playlistController.findAllPlaylists);

// PUT /api/playlists/:playlistId
//   Add the playlist of the new temporal list
router.post('/playlists', playlistController.mergePlaylists);

// DELETE /api/playlists/:playlistId
//   remove the playlist of the temporal list
router.delete('/playlists/:playlistId', function(req, res) {});

module.exports = router;