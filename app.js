var express = require('express');
var io = require('socket.io');

var app = express()
  , server = require('http').createServer(app)

server = server.listen(process.env.PORT);
io = io.listen(server);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/client_dummy.html', function(req, res){
  res.sendfile('client_dummy.html');
});

io.sockets.on('connection', function (socket) {
    
  socket.on('set nickname', function (name) {
    socket.set('nickname', name, function () { socket.emit('ready'); });
  });

  socket.on('msg', function () {
    socket.get('nickname', function (err, name) {
      console.log('Chat message by ', name);
    });
  });
});