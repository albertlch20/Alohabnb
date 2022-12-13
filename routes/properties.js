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

router.delete('/images', function(req, res) {
	console.log('E delete image')
	var collection = db.get('properties');
	var pid = req.body.pid;
	var imgName = req.body.image;
	
	console.log('PID', pid);
	console.log('imgName', imgName);

	collection.update({pid:Number(pid)}, {$pull : {"images" : String(imgName)}})
		.then(function(){
			collection.findOne({ pid: Number(pid) }, function(err, property){
				if (err) throw err;
				res.render('editProperty', property);
			});
		})
});

//create
router.post('/', function(req, res) {
	var collection = db.get('properties');
	var collection2 = db.get('users');
	router.use(express.urlencoded({ extended: true }));
	
	//amenity
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
router.post('/update', function(req, res) {
	var collection = db.get('properties');
	var is_available = (req.body.is_available === undefined);
	var maxPicId = 0;
	var fileNames=[];
	
	if (req.body.is_available === 'on') {
		is_available=Boolean(true);
	} else {
		is_available=Boolean(false);
	}
	
	console.log('E properties update');
	router.use(express.urlencoded({ extended: true }));
	
	var amenityStr = req.body.amenities;
	var amenityArr=[];
	if(amenityStr !== undefined) {
		amenityArr = amenityStr.split(',');
	}
	
	collection.find({})
		.each(function(doc){		
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

			if(filePaths.length !== 0) {
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
			}
		})
		.then(function(){
			collection.update({pid:Number(req.body.pid)}, {$addToSet : {"images" : {$each : fileNames}}});
		})
		.then(function(){
			if (req.body.pid !== undefined){
				if (req.body.title !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"title" : String(req.body.title)}});
				if (req.body.location !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"location" : String(req.body.location)}});
				if (req.body.description !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"description" : String(req.body.description)}});
				if (req.body.nightly_fee !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"nightly_fee" : Number(req.body.nightly_fee)}});
				if (req.body.cleaning_fee !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"cleaning_fee" : Number(req.body.cleaning_fee)}});
				if (req.body.service_fee !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"service_fee" : Number(req.body.service_fee)}});
				if (req.body.bedrooms !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"bedrooms" : Number(req.body.bedrooms)}});
				if (req.body.owner !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"owner" : Number(req.body.owner)}});
				if (req.body.type !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"type" : String(req.body.type)}});
				if (is_available !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$set : {"is_available" : Boolean(is_available)}});
				if (req.body.amenities !== undefined)
					collection.update({pid:Number(req.body.pid)}, {$addToSet : {"amenities" : {$each : amenityArr}}});
			}
		})
		.then(function(){
			collection.findOne({ pid: Number(req.body.pid) }, function(err, property){
				if (err) throw err;
				res.render('editProperty', property);
			});
		})
});
/*
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
});*/

router.post('/comments', function(req, res) {
	var collection = db.get('users');
	var collection2 = db.get('properties');
	var uid = req.body.uid;
	var pid = req.body.pid;
	var rating = req.body.star;
	if(!rating){
		rating = '';
	}
	//var rating = 5;
	//var text = "testing2";
	var text = req.body.text;
	//var rating = String(5);
	const date = new Date();

	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();

	let currentDate = `${month}-${day}-${year}`;
	//var reviews = '{"uid": 1, "rating": 5, "text": "goodgood", "date": "2022-11-20"}';
	var reviews = '{"uid": "'+ uid + '" , "rating": "' + rating + '", "text": "' + text + '", "date": "' + currentDate + '"}';


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