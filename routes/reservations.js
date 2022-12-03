var express = require('express');
var router = express.Router();

var monk = require('monk');

var db = monk('127.0.0.1:27017/alohabnb');

router.get('/', function(req, res) {
    var collection = db.get('reservations');
    var rid = req.query.rid;
    var userid = req.query.userid;
    if (rid === undefined && userid === undefined){
        collection.find({}, function(err, reservations){
            if (err) throw err;
            res.json(reservations);
        });
    }
    else if (userid === undefined){
        collection.findOne({ rid: Number(rid) }, function(err, reservation){
            if (err) throw err;
              res.json(reservation);
        });
    }
    else if (rid === undefined){
        collection.find({ uid: Number(userid) }, function(err, reservation){
            if (err) throw err;
              res.json(reservation);
        });
    }
    else{
        collection.findOne({ rid: Number(rid), uid: Number(userid) }, function(err, reservation){
            if (err) throw err;
              res.json(reservation);
        });
    }
});

//create
router.post('/', function(req, res) {
	var collection = db.get('reservations');
	collection.insert({ 
		rid: Number(req.query.rid),
		uid: Number(req.query.uid),
		pid: Number(req.query.pid),
		start_date: req.query.start_date,
		end_date: req.query.end_date
	}, function(err, reservation){
		if (err) throw err;
		// if insert is successfull, it will return newly inserted object
	  	res.json(reservation);
	});
});


router.delete('/delete', function(req, res) {
    var collection = db.get('reservations');
    var rid = req.query.rid;
    var userid = req.query.userid;

    if (userid !== undefined && rid !== undefined){
        collection.remove({ rid: Number(rid), uid: Number(userid) });
		res.send({ message:'Reservation is deleted' });
    } else if (rid !== undefined){
        collection.remove({ rid: Number(rid) });
		res.send({ message:'Reservation is deleted' });
    } else if (userid !== undefined){
        collection.remove({ uid: Number(userid) });
		res.send({ message:'Reservation is deleted' });
    }
});

module.exports = router;