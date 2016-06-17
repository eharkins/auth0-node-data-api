var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var jwt = require('express-jwt');
var cors = require('cors');
var http = require('http');

var pg = require('pg');
pg.defaults.ssl = true;

// var options = {
//     // global event notification;
//     error: function (error, e) {
//         if (e.cn) {
//             // A connection-related error;
//             //
//             // Connections are reported back with the password hashed,
//             // for safe errors logging, without exposing passwords.
//             console.log("CN:", e.cn);
//             console.log("EVENT:", error.message || error);
//         }
//     }
// };

// var pgp = require("pg-promise")(options);
// var db = pgp("postgresql://eli:purpleZebra@localhost:5432/mydb");





/// THIS BREAKS ON finally function:
// var sco; // shared connection object;

// db.connect()
//     .then(function (obj) {
//         // obj.client = new connected Client object;

//         sco = obj; // save the connection object;

//         // execute all the queries you need:
//         return sco.any('SELECT * FROM Users');
//     })
//     .then(function (data) {
//         // success
//     })
//     .catch(function (error) {
//         // error
//     })
//     .finally(function () {
//         // release the connection, if it was successful:
//         if (sco) {
//             sco.done();
//         }
//     });

// db.connect()
//     .then(function (obj) {
//         // obj.client = new connected Client object;
//         obj.done();
//         //console.log("SUCCESS");
//         //sco = obj; // save the connection object;

//         // // execute all the queries you need:
//         //return sco.any('SELECT * FROM user_genres');
//     })
//     .catch(function (error) {
//     	console.log("in the catch section")
//         // error
//     })
//     // .finally(function () {
//     //     // release the connection, if it was successful:
//     //     if (sco) {
//     //         sco.done();
//     //     }
//     // });

// db.connect()
//     .then(function (obj) {
//         // obj.client = new connected Client object;
//         obj.done();
//         //console.log("SUCCESS");
//         //sco = obj; // save the connection object;

//         // // execute all the queries you need:
//         //return sco.any('SELECT * FROM user_genres');
//     })
//     .catch(function (error) {
//     	console.log("in the catch section")
//         // error
//     })
//     // .finally(function () {
//     //     // release the connection, if it was successful:
//     //     if (sco) {
//     //         sco.done();
//     //     }
//     // });






var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var router = express.Router();

dotenv.load();

var authenticate = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});

app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/', routes);
app.use('/users', users);
app.use('/secured', authenticate);


app.get('/ping', function(req, res) {
  res.send("All good. You don't need to be authenticated to call this");
});

function getGenre(user_id, res){
	//console.log("getting data..");
	//
	// db.one("SELECT fav_genre AS value FROM user_genres WHERE user_id = $1", user_id )
 //    .then(function (data) {
 //        console.log("Favorite Genre:", data.value);
 //        res.writeHead(200, {"Accept": "text/html"});
 //        res.end(data.value);
 //    })
 //    .catch(function (error) {
 //        console.log("ERROR:", error);
 //    });
 console.log("logging works");
  pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT fav_genre as value FROM user_data WHERE user_id = $1', [user_id], function(err, result) {
      console.log(result.rows[0].value);
      //done();

      if(err) {
        return console.error('error running query', err);
      }
      res.writeHead(200, {"Accept": "text/html"});
      res.end(result.rows[0].value);
      //console.log(result);
    });
  });


};

function addSong(user_id, song, res){

 console.log("logging works");
  pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('UPDATE user_data SET fav_songs = $1 WHERE user_id = $2', [song, user_id], function(err, result) {
      console.log(result.rows[0].value);
      //done();

      if(err) {
        return console.error('error running query', err);
      }
      res.writeHead(200, {"Accept": "text/html"});
      res.end(result.rows[0].value);
      //console.log(result);
    });
  });


};

app.get('/secured/getFavGenre', function(req, res) {
  //res.status(200).send("All good. You only get this message if you're authenticated");
  getGenre(req.user.sub, res);
  //console.log(req.user.sub);
});

app.post('/secured/addSong', function(req, res) {
  //res.status(200).send("All good. You only get this message if you're authenticated");
  //var song = JSON.stringify(req.song);
  console.log(JSON.stringify(req.body.song));
  res.writeHead(200);
  res.end(JSON.stringify(req.body.song));
  //addSong(req.user.sub, song, res);
});

//var port = process.env.PORT || 3001;

// http.createServer(app).listen(port, function (err) {
//   console.log('listening in http://localhost:' + port);
// });

module.exports = app;

