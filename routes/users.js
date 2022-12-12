var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('127.0.0.1:27017/alohabnb');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/favourites', function(req, res) {
	var uid = req.body.uid;
	var pid = req.body.pid;
  	var collection = db.get('users');
	var collection2 = db.get('properties');
  
	if(uid !== undefined && pid !== undefined) {
		collection.update(
			{uid:Number(uid)},
			{$addToSet: {favorite_list: Number(pid)}},
			function(err, reservation){
				if (err) throw err;
				var ret = {'updateResult':'Successfully added to favourite list'};
				
				collection2.findOne({pid:Number(pid)}, function(err, property){
					if (err) throw err;
					Object.assign(ret, ret, property);
					res.render('detail', ret);
				});
			}
		);
	} else {
		res.json({"results": "Please try again" });
	}
});

router.delete('/favourites/:uid/:pid', function(req, res) {
    var collection = db.get('users');
	var collection2 = db.get('properties');
    var uid = req.params.uid;
	var pid = req.params.pid;
	const results_from_mongo = [];

	console.log(uid);
	console.log(pid);
	if(uid !== undefined && pid !== undefined) {
		collection.update(
			{uid:Number(uid)},
			{$pull: {favorite_list: Number(pid)}},
			function(err, reservation){
				if (err) throw err;
				/*collection.findOne({uid:Number(uid)}, function(err, user){
					var list=user.favorite_list;
					console.log(list);
					
					collection2.find({'pid':{$in:list}})
						.each(function(doc){
							results_from_mongo.push(doc);
						})
						.then(function(){
							res.render('favourites', {"results": results_from_mongo });
						});
				});*/
				res.send({ message:'Reservation is deleted' });
			}
		);
	} else {
		res.json({"results": "Please try again" });
	}
});

module.exports = router;
