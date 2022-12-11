var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const bcrypt = require('bcryptjs')

var monk = require('monk');
const { response } = require('express');
var db = monk('127.0.0.1:27017/alohabnb');
var collection = db.get('users');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Express'} );
});

router.get('/logged', function(req, res) {
	res.render('index2', { title: 'Express'} );
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

router.get('/newReservation', function(req, res) {
	res.render('newReservation');
});

//protected route
// router.get('/welcome', auth, function(req, res) {
// 	res.json({ message: "Welcome!!" } );

// });

router.get('/welcome', function(req, res) {
	res.render('welcome');

});


router.post('/register', function(req, res) {
	
	const {username, email, password } = req.body;

	if(!(username && email && password)){

		res.json( { error: "All fields are required!" } );
	}
	else{

		collection.findOne({ email: email }, function(err, user){
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
				let newUser = {
					uid: 6,
					username: username,
					is_host: false,
					owned_properties: [],
					favorite_list: [],
					password: hash,
					email: email
				}
				
				collection.insert(newUser, function(err, user){
					
          			if (err) throw err;
					var token = jwt.sign({ user_id: user._id, email}, 'secretkey');

					if (token){
						user.token = token;

					}
					res.json(user);

				})


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




module.exports = router;
