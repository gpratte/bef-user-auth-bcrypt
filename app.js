const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session')
const User = require('./model/user')
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


app.get('/', function (req, res) {
  res.render('home')
})

app.get('/users', function (req, res) {
  res.render('users')
})

app.post('/login', function (req, res) {
  //console.log('login ' + JSON.stringify(req.body));
  // Could/should use express validation but ...
  let found = false;
  for (let i = 0; i < users.length; ++i) {
    if (users[i].username === req.body.username && users[i].password === req.body.password) {
      found = true;
      break;
    }
  }
  if (found) {
    // Set the username is session (i.e. logged in)
    req.session.username = req.body.username
    res.render('home')
  } else {
    res.render('login', {error: true})
  }
})

app.get('/logout', function (req, res) {
  req.session.username = null
  res.render('home')
})

app.listen(3000, function () {
  console.log('Successfully started express application!');
})
