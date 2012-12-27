var express = require('express');
var io = require('socket.io');
var levelup = require('levelup')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var app = express()
  , server = require('http').createServer(app)

server = server.listen(process.env.PORT);
io = io.listen(server);

var GOOGLE_CLIENT_ID = "350370527464.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "p7iVlUlRaSpsHU2L6-l5m8bO";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://share-a-tab.unknownexception.c9.io/oauth2callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

app.use(express.cookieParser());
app.use(express.session({
    secret: "skjghskdjfhbqigohqdiouk"
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
  if (req.isAuthenticated()) { 
      res.sendfile('client_dummy.html'); }
  else {
    res.redirect('/auth/google');
  }
  
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });
  
app.get('/oauth2callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
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