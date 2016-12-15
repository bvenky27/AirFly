var express = require('express');
var selectParser = require('./selectParser.js');
var User = require('../models/user.js');

var router = express.Router()

router.get('/', function(req, res){
	res.render('home',{});
})

module.exports = router