var express = require('express');

var app = express();

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

var port = process.env.PORT || '8080';
app.listen(port, function(){
  console.log('...listening');
});
