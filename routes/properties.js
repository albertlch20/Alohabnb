var express = require('express');
var router = express.Router();
const fs = require('fs');

var monk = require('monk');

var db = monk('127.0.0.1:27017/alohabnb');
//add
router.get('/', function(req, res) {
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

router.delete('/delete', function(req, res) {
    var collection = db.get('properties');
    if (req.query.pid !== undefined){
        collection.remove({ pid: Number(req.query.pid) });
		res.send({ message:'Reservation is deleted' });
    }
});

//create
router.post('/', function(req, res) {
	var collection = db.get('properties');
	var collection2 = db.get('users');
	router.use(express.urlencoded({ extended: true }));
	
	//amenity
	console.log(req.body);
	var amenityStr = req.body.amenities;
	var amenityArr=[];
	if(amenityStr !== undefined) {
		amenityArr = amenityStr.split(',');
	}
	var maxPid = 0;
	var maxPicId = 0;
	var fileNames=[];

	collection.find({})
		.each(function(doc){		
			if(Number(doc.pid) >= maxPid) {
				maxPid = Number(doc.pid) + 1;
			}
			if(doc.images) {
				for(var i=0; i<doc.images.length; ++i) {
					var str = doc.images[i];
					var strSplit = str.split('.');
					if(Number(strSplit[0]) >= maxPicId) {
						maxPicId = Number(strSplit[0]) + 1;
					}
				}
			}
		})
		.then(function(){
			var filePaths=req.body.filepond;

			if(typeof filePaths === 'string') {
				var newId = maxPicId+1;
				fileNames.push(String(newId) + ".jpg");
				var newFilePath = __dirname + "/../public/" + fileNames[0];
				fs.rename(filePaths, newFilePath, (err)=>{});
			} else if(typeof filePaths === 'object') {
				for(var i=0; i<filePaths.length; ++i) {
					var newId = maxPicId+i;
					fileNames[i] = String(newId) + ".jpg";
					var newFilePath = __dirname + "/../public/" + fileNames[i];
					fs.rename(filePaths[i], newFilePath, (err)=>{});
				}
			}
		})
		.then(function(){
			collection.insert({ 
				title: req.body.title,
				location: req.body.location,
				description:req.body.description,
				nightly_fee: Number(req.body.nightly_fee),
				cleaning_fee: Number(req.body.cleaning_fee),
				service_fee: Number(req.body.service_fee),
				amenities: amenityArr,
				pid: Number(maxPid),
				bedrooms: Number(req.body.bedrooms),
				type: req.body.type,
				is_available: true,
				reviews: [],
				owner: Number(req.body.uid)
			}, function(err, property){
				if (err) throw err;
			});
		})
		.then(function(){
			collection2.update({uid:Number(req.body.uid)}, {$addToSet : {"owned_properties" : Number(maxPid)}});
		})
		.then(function(){
			collection.update({pid:Number(maxPid)}, {$addToSet : {"images" : {$each : fileNames}}})
				.then(function(){
					res.render('addProperty', {"results": "Your property is registered successfully!"});
				});
		});
});

//update
router.put('/update', function(req, res) {
    var collection = db.get('properties');
	var is_available=(req.query.is_available==='true' || req.query.is_available==='1' || req.query.is_available==='True');
    if (req.query.pid !== undefined){
        if (req.query.title !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"title" : req.query.title}}, {upsert : false}, {multi : false});
	    if (req.query.location !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"location" : req.query.location}}, {upsert : false}, {multi : false});
		if (req.query.description !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"description" : req.query.description}}, {upsert : false}, {multi : false});
		if (req.query.nightly_fee !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"nightly_fee" : Number(req.query.nightly_fee)}}, {upsert : false}, {multi : false});
		if (req.query.cleaning_fee !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"cleaning_fee" : Number(req.query.cleaning_fee)}}, {upsert : false}, {multi : false});
		if (req.query.service_fee !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"service_fee" : Number(req.query.service_fee)}}, {upsert : false}, {multi : false});
		if (req.query.bedrooms !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"bedrooms" : Number(req.query.bedrooms)}}, {upsert : false}, {multi : false});
		if (req.query.owner !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"owner" : Number(req.query.owner)}}, {upsert : false}, {multi : false});
	    if (req.query.type !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"type" : req.query.type}}, {upsert : false}, {multi : false});
	    if (req.query.is_available !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$set : {"is_available" : is_available}}, {upsert : false}, {multi : false});
		if (req.query.amenities_insert !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$addToSet : {"amenities" : req.query.amenities_insert}}, {upsert : false}, {multi : false});
		if (req.query.amenities_delete !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$pull : {"amenities" : req.query.amenities_delete}}, {upsert : false}, {multi : false});
		if (req.query.image_insert !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$addToSet : {"images" : req.query.image_insert}}, {upsert : false}, {multi : false});
		if (req.query.image_delete !== undefined)
			collection.update({pid:Number(req.query.pid)}, {$pull : {"images" : req.query.image_delete}}, {upsert : false}, {multi : false});
		res.send({ message:'Properties is updated' });
    }
});

router.post('/comments', function(req, res) {
	var collection = db.get('users');
	var collection2 = db.get('properties');
	var uid = req.body.uid;
	var pid = req.body.pid
	//var text = "testing2";
	var text = req.body.text;
	//var rating = String(5);
	var rating = 5;
	const date = new Date();

	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();

	let currentDate = `${month}-${day}-${year}`;
	console.log(pid);
	//var reviews = '{"uid": 1, "rating": 5, "text": "goodgood", "date": "2022-11-20"}';
	var reviews = '{"uid": '+ 1 + ', "rating": ' + rating + ', "text": "' + text + '", "date": "' + currentDate + '"}';


	if(uid !== undefined && pid !== undefined) {
		collection2.update(
			{pid:Number(pid)},
			{$addToSet: {reviews: JSON.parse(reviews)}},
			function(err, comment){
				if (err) throw err;
				var ret = {'updateResult':'Successfully added comment'};

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

router.post('/comments', function(req, res) {
	var collection = db.get('users');
	var collection2 = db.get('properties');
	var uid = req.body.uid;
	var pid = req.body.pid
	//var text = "testing2";
	var text = req.body.text;
	//var rating = String(5);
	var rating = 5;
	const date = new Date();

	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();

	let currentDate = `${month}-${day}-${year}`;
	console.log(pid);
	//var reviews = '{"uid": 1, "rating": 5, "text": "goodgood", "date": "2022-11-20"}';
	var reviews = '{"uid": '+ 1 + ', "rating": ' + rating + ', "text": "' + text + '", "date": "' + currentDate + '"}';


	if(uid !== undefined && pid !== undefined) {
		collection2.update(
			{pid:Number(pid)},
			{$addToSet: {reviews: JSON.parse(reviews)}},
			function(err, comment){
				if (err) throw err;
				var ret = {'updateResult':'Successfully added comment'};

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

router.post('/setUnavail', function(req, res) {
	console.log('API users/setUavail');
	var uid = req.body.uid;
	var pid = req.body.pid;
	var collection = db.get('users');
	var collection2 = db.get('properties');
	var results_from_mongo = [];
	
	console.log('uid', uid);
	console.log('pid', pid);
	
	collection2.update({'pid' : Number(pid)}, {$set : {"is_available" : Boolean(false)}})
		.then(function(){
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
			});
		});
});

module.exports = router;