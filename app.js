var express = require('express');
var io = require('socket.io');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  
var app = express()
  , server = require('http').createServer(app);

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
app.configure(function() {
    app.set('views', __dirname);
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "skjghskdjfhbqigohqdiouk"
    }));
    app.use(passport.initialize());
    app.use(passport.session());
});

app.get('/', function(req, res){
  if (req.isAuthenticated()) {       
    res.render('index', { user: req.user});
  }
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
    console.log("authorized with google");
    res.redirect('/');
  });

io.sockets.on('connection', function (socket) {
   
  socket.on('set userid', function (userid) {
     socket.join(userid);    
     socket.set('userid', userid, function () { socket.emit('ready', io.sockets.manager.rooms); });     
  });  
  
  socket.on('upload_syncdata', function (syncdata) {     
      socket.emit('trying_to_notify', syncdata.to);
      io.sockets.in(syncdata.to).emit('download_syncdata', syncdata);      
  });
  
  socket.on('download_complete', function (from) {
      console.log('download_complete');   
      io.sockets.in(from).emit('finish_sync');   
  });
  
});
/*
do not work at windows 
var db_options = { createIfMissing: true, errorIfExists: false }
var db = levelup('./mydb', db_options);

var saveHref = function () {    
    db.put('name', 'LevelUP', function (err) {
      if (err) return console.log('Ooops!', err) // some kind of I/O error    
      db.get('name', function (err, value) {
        if (err) return console.log('Ooops!', err) // likely the key was not found    
        console.log('name=' + value)
      });
    });
    */
}