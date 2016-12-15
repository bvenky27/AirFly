var express = require('express')
var logger = require('./logger.js');
var selectParser = require('./selectParser.js');
var connectionPool = require('./connectionPool.js');
var ticket_model = require('../models/reservation.js');
var router = express.Router()
router.post("/",function(req, res){
	var json_obj= req.body
	console.log(json_obj);
	console.log(typeof json_obj);
	var booking_id = json_obj["booking_id"];
	ticket_model.cancel(booking_id,function(booo){
		
		if(booo){
			res.send({"status":"success", "booking_id":booking_id});
		}else{
			res.send({"status":"failed"});
		}
	});
});
router.get("/",function(req,res){

	var queryString = "select res.reservation_id, r.src_ap, r.dst_ap, s.departure_time, s.arrival_time, al.airline, al.alid, res.status"+
	"from reservations res"+
	"inner JOIN schedules s ON res.schedule_id = s.sid"+
	"inner JOIN flights f ON s.flight_id = f.fid"+
	"inner JOIN routes r ON f.route_id = r.rid"+
	"inner JOIN airlines al ON r.airline = al.iata"+
	"where res.uid = $user_id and status!= $status;"

	queryString = queryString.replace("$user_id",user_id);
	queryString = queryString.replace("$status", "'CANCELLED'");
	console.log("Query need to executes is "+queryString)
	connectionPool.query(queryString, function(err, rows){
		

		if(!err){
		var formated_result = formated_date(rows);
		console.log(formated_result);
		res.render('cancel',{ cancel_result_data:formated_result})
	 }else{
		 console.log("error");
		 console.log(err);
		 res.send('error');
	 } 

	});
})



module.exports = router

