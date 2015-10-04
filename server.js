var express = require('express');

var tzwhere = require('tzwhere');
tzwhere.init();

var app = express();

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

app.listen('8080', function(){
  console.log('...listening');
});
