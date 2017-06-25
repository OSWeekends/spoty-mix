const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.promise = Promise;

const _ = require('lodash');
const Q = require('q');

const Playlist = new Schema({
    spotifyId: {
        type: String
    },
    playlist: {
        type: Mixed
    }
});

let Playlist = module.exports = mongoose.model('Playlist', PlaylistSchema);