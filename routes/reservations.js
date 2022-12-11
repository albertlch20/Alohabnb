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
	var collection2 = db.get('properties');
	const {uid, pid, checkinDate, checkoutDate} = req.body;
	var reserveResult=true;
	var maxRid = 1;

	//Check availability
	collection2.findOne({ pid: Number(pid) }, function(err, property){
        if (err) throw err;
		if(property.is_available == true) {
			function stringToDate(_date,_format,_delimiter) {
				var formatLowerCase=_format.toLowerCase();
				var formatItems=formatLowerCase.split(_delimiter);
				var dateItems=_date.split(_delimiter);
				var monthIndex=formatItems.indexOf("mm");
				var dayIndex=formatItems.indexOf("dd");
				var yearIndex=formatItems.indexOf("yyyy");
				var month=parseInt(dateItems[monthIndex]);
				month-=1;
				var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
				return formatedDate;
			}
			
			collection.find({})
				.each(function(doc){
					var start1 = stringToDate(doc.start_date, 'yyyy-mm-dd', '-');
					var end1 = stringToDate(doc.end_date, 'yyyy-mm-dd', '-');
					var start2 = stringToDate(checkinDate, 'yyyy-mm-dd', '-');
					var end2 = stringToDate(checkoutDate, 'yyyy-mm-dd', '-');
					
					if(doc.rid >= maxRid) {
						maxRid = doc.rid + 1;
					}
					
					if(pid == doc.pid && start1 <= end2 && start2 <= end1) {
						reserveResult=false;
					}
				})
				.then(function(){
					var today = new Date();
					
					if(uid === undefined || uid === '') {
						res.render('newReservation', {"results": "Please log in first"});
					} else if(checkinDate === undefined || checkoutDate === undefined || stringToDate(checkinDate, 'yyyy-mm-dd', '-') <= today
						|| stringToDate(checkinDate, 'yyyy-mm-dd', '-') >= stringToDate(checkoutDate, 'yyyy-mm-dd', '-')
						|| checkinDate === "" || checkoutDate === "") {
						res.render('newReservation', {"results": "Wrong date input" });
					} else if(reserveResult === false) {
						res.render('newReservation', {"results": "Not available. Please try another time period"});
					} else {
						collection.insert({ 
							rid: maxRid,
							uid: Number(uid),
							pid: Number(pid),
							start_date: checkinDate,
							end_date: checkoutDate
						}, function(err, reservation){
							if (err) throw err;
							res.render('newReservation', {"results": "Reservation has been made" });
						});
					}
				});
		} else {
			res.render('newReservation', {"results": "Property is set unavailable by the host" });
		}
    });
});

router.delete('/:rid', function(req, res) {
    var collection = db.get('reservations');
    var rid = req.params.rid;

	if (rid !== undefined){
        collection.remove({ rid: Number(rid) });
		res.send({ message:'Reservation is deleted' });
    }
});

module.exports = router;