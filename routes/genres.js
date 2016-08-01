var express = require('express');
var router = express.Router();

var db = require('pg');
db.defaults.ssl = true;


function queryGenre(user_id, res){
	
 console.log("logging works");
  db.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting data...');

  client
    .query('SELECT fav_genre as value FROM user_data WHERE user_id = $1', [user_id], function(err, result) {
      console.log(result.rows[0].value);

      if(err) {
        return console.error('error running query', err);
      }
      //res.writeHead(200, {"Accept": "text/html"});
      res.send(result.rows[0].value);
    });
  });

};

router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});


router.get('/', function(req, res) {
   queryGenre(req.user.sub, res);
});

// router.get('/', function(req, res, ) {
//   res.send('respond with a resource');
// });

module.exports = router;