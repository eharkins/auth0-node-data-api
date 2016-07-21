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



var app = express();
var router = express.Router();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));


var routes = require('./routes/index');
var users = require('./routes/users');



dotenv.load();

var authenticate = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});



app.use('/', routes);
app.use('/users', users);
app.use('/secured', authenticate);


app.get('/ping', function(req, res) {
  res.send("All good. You don't need to be authenticated to call this");
});

function getSongs(user_id, res){
 
 console.log("getSong method executing");
  pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting data...');

  client
    .query('SELECT songname as value FROM songs WHERE user_id = $1', [user_id], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }

      console.log(result.rows);
      var i = 0;
      var songs = [];
      while (result.rows[i] )
      {
        songs[i] = result.rows[i].value;
        console.log(result.rows[i].value);
        i++;
      }
      var song_json = JSON.stringify({Songs:songs});
      console.log(song_json);

      
      res.writeHead(200, {"Accept": "application/json"});
      res.end(song_json);
      //console.log(result);
    });
  });


};

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

function getGenre(user_id, res){
	
 console.log("logging works");
  pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting data...');

  client
    .query('SELECT fav_genre as value FROM user_data WHERE user_id = $1', [user_id], function(err, result) {
      console.log(result.rows[0].value);

      if(err) {
        return console.error('error running query', err);
      }
      res.writeHead(200, {"Accept": "text/html"});
      res.end(result.rows[0].value);
    });
  });

};

function addSong(user_id, song, res){

 console.log("addSong method executing");
  pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Writing data...');

  client
    .query('INSERT INTO songs VALUES (100, $1, $2)', [song, user_id], function(err, result) {
      console.log(JSON.stringify(result));
      //done();

      if(err) {
        return console.error('error running query', err);
      }
      res.writeHead(200, {"Accept": "text/html"});
      res.end(song);
      //console.log(result);
    });
  });

  };

function getPlays(user_id, res){
 
 console.log("getPlays method executing");
  pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting data...');

  client
    .query('SELECT total_plays as value FROM playlists WHERE user_id = $1', [user_id], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      var plays = result.rows[0].value;

      console.log(plays);
      

      
      res.writeHead(200, {"Accept": "text/html"});
      res.end(plays);
      //console.log(result);
    });
  });


};

function changeDisplayName(user_id, displayName, res){

    console.log(user_id);
    var fullPath = '/api/v2/users/' + user_id;
    var options = {
      hostname: 'https://eliharkins.auth0.com',
      //port: 80,
      path: fullPath,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //'Content-Length': Buffer.byteLength(postData)
      },
      body: {
        'user_metadata': {
          'displayName': displayName
        }
      }
    };

    var req = http.request(options, (res) => {
      console.log('STATUS: ' + res.statusCode );
      console.log('HEADERS: ' + JSON.stringify(res.headers) );
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log('BODY: ' + chunk);
      });
      res.on('end', () => {
        console.log('No more data in response.')
      })
    });

    req.on('error', (e) => {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(postData);
    req.end();

    res.writeHead(200, {"Accept": "text/html"});
    res.end(displayName);

};


app.get('/secured/changeDisplayName', function(req, res){
    console.log("changeDisplayName: ");
    var displayName = req.body.displayName;
    console.log(displayName);
    changeDisplayName(req.user.sub, displayName, res);
});


app.get('/secured/getPlays', function(req, res){
  console.log("getPlays");
  getPlays(req.user.sub, res);
});

app.get('/secured/getSongs', function(req, res){
  console.log("getSongs");
  getSongs(req.user.sub, res);
});

app.get('/secured/getFavGenre', function(req, res) {
  getGenre(req.user.sub, res);
});

app.post('/secured/addSong', function(req, res) {
  var song = req.body.song;
  //console.log(req);
  console.log("REQUEST.BODY.song: " + song);
  // res.writeHead(200);
  addSong(req.user.sub, song, res);
});

//var port = process.env.PORT || 3001;

// http.createServer(app).listen(port, function (err) {
//   console.log('listening in http://localhost:' + port);
// });

module.exports = app;

