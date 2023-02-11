var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('video');
});

router.get('/disclaimer', function(req, res, next) {
  res.render('disclaimer', { title: 'FFF: Disclaimer' });
});

module.exports = router;
