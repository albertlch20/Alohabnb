var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const bcrypt = require('bcryptjs')
const formidable = require('formidable');

var monk = require('monk');
const { response } = require('express');
var db = monk('127.0.0.1:27017/alohabnb');
var collection = db.get('users');

/* GET home page. */
router.get('/', function(req, res) {
	var collection = db.get('properties');
	
	const results_from_mongo = [];

	collection.find({is_available:true})
		.each(function(doc){
			results_from_mongo.push(doc);
		})
		.then(function(){
			res.render('index', {"results": results_from_mongo });
		});
});

router.get('/search', function(req, res) {
	var collection = db.get('properties');
	
	const results_from_mongo = [];

	collection.find({})
		.each(function(doc){
			results_from_mongo.push(doc);
		})
		.then(function(){
			res.render('index', {"results": results_from_mongo });
		});
});

router.get('/search2', function(req, res) {
	var collection = db.get('properties');
	
	const results_from_mongo = [];

	collection.find({})
		.each(function(doc){
			results_from_mongo.push(doc);
		})
		.then(function(){
			res.render('index2', {"results": results_from_mongo });
		});
});

router.get('/search/:in', function(req, res) {
	var input = req.params.in;
	var i=0;
	
	if(input !== undefined) {
		var collection = db.get('properties');
		
		const results_from_mongo = [];

		collection.find({})
			.each(function(doc){
				results_from_mongo.push(doc);
			})
			.then(function(){
				if(input !== undefined || input != '') {
					while(i<results_from_mongo.length) {
						if (
							(results_from_mongo[i].title.toLowerCase().indexOf(
								input.toLowerCase()
							) == -1) &&
							(results_from_mongo[i].location.toLowerCase().indexOf(
								input.toLowerCase()
							) == -1) &&
							(results_from_mongo[i].type.toLowerCase().indexOf(
								input.toLowerCase()
							) == -1)
						) {
							results_from_mongo.splice(i, 1);
						} else {
							++i;
						}
					}
				}
			})
			.then(function(){
				res.render('index', {"results": results_from_mongo });
			});
	}
});

router.get('/search2/:in', function(req, res) {
	var input = req.params.in;
	var i=0;
	
	if(input !== undefined) {
		var collection = db.get('properties');
		
		const results_from_mongo = [];

		collection.find({})
			.each(function(doc){
				results_from_mongo.push(doc);
			})
			.then(function(){
				if(input !== undefined || input != '') {
					while(i<results_from_mongo.length) {
						if (
							(results_from_mongo[i].title.toLowerCase().indexOf(
								input.toLowerCase()
							) == -1) &&
							(results_from_mongo[i].location.toLowerCase().indexOf(
								input.toLowerCase()
							) == -1) &&
							(results_from_mongo[i].type.toLowerCase().indexOf(
								input.toLowerCase()
							) == -1)
						) {
							results_from_mongo.splice(i, 1);
						} else {
							++i;
						}
					}
				}
			})
			.then(function(){
				res.render('index2', {"results": results_from_mongo });
			});
	}
});

router.get('/details/:pid', function(req, res) {
	var pid = req.params.pid;
	var collection = db.get('properties');
	const results_from_mongo = [];

	collection.findOne({ pid: Number(pid) }, function(err, property){
		if (err) throw err;
		res.render('detail', property);
	});
});

router.get('/editProperty/:pid', function(req, res) {
	var pid = req.params.pid;
	var collection = db.get('properties');
	const results_from_mongo = [];

	collection.findOne({ pid: Number(pid) }, function(err, property){
		if (err) throw err;
		res.render('editProperty', property);
	});
});

router.get('/favourites/:uid', function(req, res) {
	var uid = req.params.uid;
	var collection = db.get('users');
	var collection2 = db.get('properties');
	const results_from_mongo = [];
	
	collection.findOne({uid:Number(uid)}, function(err, user){
		var list=user.favorite_list;
		
		collection2.find({'pid':{$in:list}})
			.each(function(doc){
				results_from_mongo.push(doc);
			})
			.then(function(){
				res.render('favourites', {"results": results_from_mongo });
			});
	});
});

router.get('/logged', function(req, res) {
	var collection = db.get('properties');
	
	const results_from_mongo = [];

	collection.find({is_available:true})
		.each(function(doc){
			results_from_mongo.push(doc);
		})
		.then(function(){
			res.render('index2', {"results": results_from_mongo });
		});
});

router.get('/login', function(req, res) {
	res.render('login');

});

router.get('/register', function(req, res) {
	res.render('register');

});

router.get('/reservationsList/:uid', function(req, res) {
	var collection = db.get('reservations');
    var uid = req.params.uid;
	
    if (uid !== undefined){
		const results_from_mongo = [];

		collection.find({uid : Number(uid)}, {sort: {start_date: 1}})
			.each(function(doc){
				results_from_mongo.push(doc);
			})
			.then(function(){
				res.render('reservationsList', {"results": results_from_mongo });
			});
    }
});

router.get('/newReservation/:pid', function(req, res) {
	var pid = req.params.pid;
	
	if (pid !== undefined){
		res.render('newReservation', {"pid" : req.params.pid});
	}
});

//protected route
// router.get('/welcome', auth, function(req, res) {
// 	res.json({ message: "Welcome!!" } );

// });

router.get('/welcome', function(req, res) {
	res.render('welcome');

});

router.get('/host/:uid', function(req, res) {
	var collection = db.get('users');
	var collection2 = db.get('properties');
    var uid = req.params.uid;
	const results_from_mongo = [];
    if (uid !== undefined){
		collection.findOne({ uid: Number(uid) }, function(err, user){
			if (err) throw err;
			var list = user.owned_properties;
			collection2.find( {'pid' : {$in:list} } )
			.each(function(doc){
				results_from_mongo.push(doc);
			})
			.then(function(){
				res.render('host', {"results": results_from_mongo });
			});
			//res.json(results_from_mongo)
			//res.render('host', {"results": results_from_mongo } );
    	});
	}
});

router.get('/addProperty', function(req, res) {
	res.render('addProperty');
});

router.post('/register', function(req, res) {
	
	const {username, email, password } = req.body;

	if(!(username && email && password)){

		res.json( { error: "All fields are required!" } );
	}
	else{

		collection.findOne({$or: [{ email: email }, {username: username}]}, function(err, user){
			if (err) throw err;

			if (user){
				res.json({ error : "User already exists. Please login!"} );

			}
			else if (!email.match(/^\S+@[0-9a-zA-Z]+.[0-9a-zA-Z]+$/)){
				res.json({ error : "Please enter a valid email!"} );
			}
			else if (password.length < 6){
				res.json({ error : "Please enter a stronger password!"} );
			}
			else{
				var hash = bcrypt.hashSync(password, 10);
				collection.count()
				.then(c => {
					let newUser = {
						uid: c+1,
						username: username,
						is_host: false,
						owned_properties: [],
						favorite_list: [],
						password: hash,
						email: email
					};

					collection.insert(newUser, function(err, user){
					
						if (err) throw err;
						var token = jwt.sign({ user_id: user._id, email}, 'secretkey');

						if (token){
							user.token = token;

						}
						res.json(user);

					});
				});

				



			}


		});	

	}



});

router.post('/login', function(req, res) {
	const {username, password } = req.body;

	if(!(username && password)){

		res.json({ error: "All fields are required!" } );
	}
	else{

		collection.findOne({ username: username }, function(err, user){
			if (err) throw err;
			if(user == null){

				res.json({ error: "User doesn't exist" } );

			}
			else{
				if (bcrypt.compareSync(password, user.password) ){
					var token = jwt.sign({ user_id: user._id, username}, 'secretkey');
					user.token = token;
					res.json(user);

				}
				else{
					res.json( {error: "Username or password is incorrect!" } );

				}

			}

		});

	}

});

// get properties
router.get('/properties2', function(req, res) {
	var collection = db.get('properties');
	if (req.query.pid === undefined){
		collection.find({}, function(err, properties){
			if (err) throw err;
			res.json(properties);
		});
	}
	else{
		collection.findOne({ pid: Number(req.query.pid) }, function(err, property){
			if (err) throw err;
			res.json(property);
		});
	}
});

// get login user
router.get('/login_user', function(req, res) {
	res.json({
		uid: 2,
		favorite_list: [1, 2]
	});
});
//get test
// get properties
router.get('/test', function(req, res) {
	var collection = db.get('test');
	if (req.query.pid === undefined){
		collection.find({}, function(err, test){
			if (err) throw err;
			res.json(test);
		});
	}
	else{
		collection.findOne({ pid: Number(req.query.pid) }, function(err, test){
			if (err) throw err;
			res.json(test);
		});
	}
});

router.post("/upload", function(req, res){
  console.log("BEGIN /upload");
  const form = formidable({ multiples: false });
	
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    let theFile = files.filepond.filepath;
    console.log("theFile: " + theFile);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(theFile);
  });  
})

module.exports = router;
