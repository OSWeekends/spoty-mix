const express = require('express');

const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const loginCtrl = require('../controllers/login');
const router = express.Router();

router.get('/', loginCtrl.redirectLogin);

router.get('/auth/spotify',
    passport.authenticate('spotify', { scope: ['playlist-modify', 'user-library-modify', 'playlist-read', 'playlist-modify-public', 'playlist-modify-private'], showDialog: true }),
    (req, res) => {});

router.get('/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }), (req, res) => { res.redirect('/'); });

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/index', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('index', { token: decodeURIComponent(req.query.token) });
    } else {
        res.redirect('/');
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}

module.exports = router;