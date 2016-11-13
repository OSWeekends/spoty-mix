
var express = require('express');
var router = express.Router();
var firebase = require('firebase');

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
router.put('/playlists/:playlistId', function(req, res){});

// DELETE /api/playlists/:playlistId
//   remove the playlist of the temporal list
router.delete('/playlists/:playlistId', function(req, res){});

module.exports = router;