var express = require('express');
var io = require('socket.io');
var levelup = require('levelup')

var app = express()
  , server = require('http').createServer(app)

server = server.listen(process.env.PORT);
io = io.listen(server);

app.use(express.cookieParser());
app.use(express.session({
    secret: "skjghskdjfhbqigohqdiouk"
}));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/client_dummy.html', function(req, res){
  res.sendfile('client_dummy.html');
});

io.sockets.on('connection', function (socket) {
    
  socket.on('set location', function (href) {
      saveHref(href);
      socket.set('location', href, function () { socket.emit('ready'); });
  });

  socket.on('msg', function () {
    socket.get('nickname', function (err, name) {
      console.log('Chat message by ', name);
    });
  });
});

var options = { createIfMissing: true, errorIfExists: false }
var db = levelup('./mydb', options)

var saveHref = function () {
    // 2) put a key & value
    db.put('name', 'LevelUP', function (err) {
      if (err) return console.log('Ooops!', err) // some kind of I/O error
    
      // 3) fetch by key
      db.get('name', function (err, value) {
        if (err) return console.log('Ooops!', err) // likely the key was not found
    
        // ta da!
        console.log('name=' + value)
      })
    })
}