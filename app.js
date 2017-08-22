const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session')
const User = require('./model/user')
const MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/auth');

const app = express();
app.engine('mustache', mustacheExpress());
app.set('views', './views')
app.set('view engine', 'mustache')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set up session middleware. Don't know what the properties mean yet
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// Keep track of which routes have been accessed in session. Have to do this in the browser because it will save the cookie.
app.use(function (req, res, next) {
  if (req.url === '/users' && !req.session.username) {
    res.render('login')
  } else {
    next()
  }
})

// Connection URL
const url = 'mongodb://localhost:27017/myauth';
// db connection
let database;

app.get('/', function (req, res) {
  res.render('home')
})

app.get('/register', function (req, res) {
  res.render('register')
})

app.get('/users', function (req, res) {
  User.find()
    .then(function(users) {
      res.render('users', {users: users})
    })
})

app.post('/register', function (req, res) {
  let user = new User({username: req.body.username, password: req.body.password})
  user.save()
    .then(function(results) {
      //console.log('saved ' + JSON.stringify(results, null, 2));
      req.session.username = req.body.username
      User.find()
        .then(function(users) {
          res.render('users', {users: users})
        })
    })
})

app.post('/login', function (req, res) {
  // first find the user
  User.authenticate(req.body.username, req.body.password, function(err, user) {
    //console.log('authenticate returned err=' + err + ' user=' + user);
    if (!err && user) {
      req.session.username = req.body.username
      User.find()
        .then(function(users) {
          res.render('users', {users: users})
        })
    } else {
      //console.log('return login with error');
      res.render('login', {error: true})
    }
  })
})

app.get('/logout', function (req, res) {
  req.session.username = null
  res.render('home')
})

app.listen(3000, function () {
  console.log('Successfully started express application!');
})

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to mongodb");
  database = db;
});

process.on('SIGINT', function() {
  console.log("\nshutting down");
  database.close(function () {
    console.log('mongodb disconnected on app termination');
    process.exit(0);
  });
});
