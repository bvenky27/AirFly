var express = require('express')
var logger = require('./logger.js');
var selectParser = require('./selectParser.js');
var connectionPool = require('./connectionPool.js');
var ticket_model = require('../models/reservation.js');
const uuidV1 = require('uuid');
var router = express.Router()
router.post("/",function(req, res){
	var json_obj= req.body
	console.log(json_obj);
	console.log(typeof json_obj);
	var schedules = json_obj["schedules"];
	var passengers = json_obj["passengers"];
	var class_id = json_obj["class_id"];
	var user_id  = '1';
	console.log("user id is "+1);
	var r_str = uuidV1();
	var tickets = [];
	var num_fare_data = [];
    for(var i = 0 ; i < schedules.length; i++){
		tickets.push({"SCHEDULE_ID":schedules[i],"status":"BOOKED","BOOKING_ID":r_str,"CLASS_ID":class_id,"USER_ID":parseInt(user_id),ord:(i+1)});
		num_fare_data.push({"CLASS_ID":class_id, "SCHEDULE_ID":schedules[i]});
	}
	var passengers_data = []
	for(var i = 0 ; i < passengers.length; i++){
		var name = passengers[i]["name"]
		var phone_num = passengers[i]["phone_num"]
		var email = passengers[i]["email"];
		var isPrimary = passengers[i]["is_primary"];
		if(!isPrimary){
			isPrimary = 0;
		}
		if(typeof email === 'undefined'){
			email = ""
		}
		if(typeof phone_num === 'undefined'){
			phone_num = ""
		}
		passengers_data.push({"BOOKING_ID":r_str, "NAME": name, "PHONE_NUM":phone_num, "EMAIL":email, "IS_PRIMARY":isPrimary});
	}
	console.log("In ticket booking page");
	console.log(r_str);
	ticket_model.book(tickets,passengers_data,num_fare_data,function(booo){
		if(booo){
			res.send({"status":"success", "booking_id":r_str});
		}else{
			res.send({"status":"failed"});
		}
	});
});
module.exports = router