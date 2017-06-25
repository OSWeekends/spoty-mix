var express = require('express');
var router = express.Router();

router.get('/home', function(req, res){
  res.render('templates/home');
});

router.get('/mix', function(req, res){
  res.render('templates/mix');
});

router.get('/playlist', function(req, res){
  res.render('templates/playlist');
});

module.exports = router;