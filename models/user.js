const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.promise = Promise;

const _ = require('lodash');
const Q = require('q');
const Moment = require('moment');

const UserSchema = new Schema({
    spotifyId: { type: String, index: true },
    tokenId: { type: String },
    creationDate: { type: Date }
});

let User = module.exports = mongoose.model('User', UserSchema);

module.exports.create = (user) => {
    User.existSpotifyId(user.spotifyId).then(data => {
        if (!data.exist) {
            user.creationDate = Moment.utc().format();
            return user.save();
        } else {
            return User.refreshToken(data.user._id, user.token);
        }
    });
};

module.exports.existSpotifyId = (spotifyId) => {
    const query = { spotifyId };

    return User.findOne(query).then(user => {
        return { exist: !!user, user };
    });
};

module.exports.refreshToken = (userId, token) => {
    return User.findByIdAndUpdate(userId, { token }, { new: true });
};

module.exports.getByUserId = (userId) => {
    return User.findById(userId);
};

module.exports.getBySpotifyId = (spotifyId) => {
    return User.findOne({ spotifyId });
};