const Playlist = require('./playlist');
const passport = require('passport');
const SpotifyWebApi = require('spotify-web-api-node');
const SpotifyStrategy = require('passport-spotify').Strategy;
const jwt = require('jsonwebtoken');

const config = require('../config/config');
const appKey = config.spotify.clientID;
const appSecret = config.spotify.clientSecret;
let spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientID,
    clientSecret: config.spotify.clientSecret,
    redirectUri: `${config.express.urlBase}/spotify/callback`
});

const User = require('../models/user');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new SpotifyStrategy({
    clientID: appKey,
    clientSecret: appSecret,
    callbackURL: `${config.express.urlBase}/spotify/callback`
}, (accessToken, refreshToken, profile, done) => {
    try {
        spotifyApi.setAccessToken(accessToken);
        profile.accessToken = accessToken;
        let authorizeURL = spotifyApi.createAuthorizeURL(['playlist-modify', 'user-library-modify', 'playlist-read', 'playlist-modify-public', 'playlist-modify-private'], "spoti-mix");

        done(null, profile);
    } catch (e) {
        done(e);
    }
}));

module.exports.redirectLogin = (req, res) => {
    if (req.user) {
        let user = new User({ spotifyId: req.user.id, token: req.user.accessToken });
        const token = encodeURIComponent(jwt.sign({ id: req.user.id, token: req.user.accessToken, publicUrl: req.user._json.href },
            config.express.secret, { expiresIn: 60 * 5 * 60 * 1000 }));

        res.redirect(`/index?token=${token}`);
    } else {
        res.render('login');
    }
};