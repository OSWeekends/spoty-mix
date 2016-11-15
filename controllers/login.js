var Playlist = require('./playlist');
var passport = require('passport');
var SpotifyWebApi = require('spotify-web-api-node');
var SpotifyStrategy = require('passport-spotify').Strategy;
var config = require('../config');
var spotifyApi = new SpotifyWebApi({
  clientId : config.spotify.clientID,
  clientSecret : config.spotify.clientSecret,
  redirectUri : 'http://www.localhost.8080/callback'
});

var appKey = config.spotify.clientID;
var appSecret = config.spotify.clientSecret;


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
    spotifyApi.setAccessToken(accessToken);
    profile.accessToken = accessToken;
    console.log("accesstoken", profile.accessToken)
    var authorizeURL = spotifyApi.createAuthorizeURL(['playlist-modify', 'user-library-modify', 'playlist-read', 'playlist-modify-public', 'playlist-modify-private'], "me_lo_invento");
    console.log('URL:', authorizeURL);
    process.nextTick(function () {
      return done(null, profile);
    });
  }));

  module.exports.doLogin = function(id, data, token){
    Playlist.writeUserData(id, data, token);
  }