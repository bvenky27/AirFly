var express = require('express')
var selectParser = require('./selectParser.js');
var connectionPool = require('./connectionPool.js');
var router = express.Router()

//middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  console.log("In the schedule request");
  next()
})
//define the home page route
router.get('/', function (req, res) {

  var start_date = req.query.start_date;
  var return_date = req.query.returnDate;
  var seats = req.query.num_passenger;
  var clas = req.query.class;
  var s_airport_id = req.query.source_airport_id;
  var d_airport_id = req.query.dest_airport_id;
  var trip_type = req.query.tripType;
  res.set({
  'Content-Type': 'application/json',
  "Access-Control-Allow-Origin": '*'
  });
  if(trip_type == 'round'){
  	  var final_result = [];
  	  getFlights(start_date,seats,clas,s_airport_id,d_airport_id,function(result){
  	  	final_result.push(result);
  	  	getFlights(return_date,seats,clas,d_airport_id,s_airport_id,function(result){
  	  		final_result.push(result);
  	  		console.log(final_result);
  	  		res.render('searchList',{ result_data:final_result, trip_type: trip_type, clazz: clas,"passenger_count":seats})
  	  	});
     });}else{
  	  	getFlights(start_date,seats,clas,s_airport_id,d_airport_id,function(result){
  	  		res.render('searchList',{ result_data:result, trip_type: trip_type, clazz: clas,"passenger_count":seats})
  	  	});
  	  }
  });

function getFlights(start_date,seats,clas,s_airport_id,d_airport_id,callback){

  queryString = "SELECT al.name, r.alid, r.airline,f.flight_id , r.src_ap, r.dst_ap, r.stops, sf.seat_fare, sc.departure_time, sc.arrival_time,TIMEDIFF(sc.arrival_time,sc.departure_time),sc.id as duration, sf.remaining_seats, sc.id " +
	  "FROM routes r"+
	"inner JOIN flights f ON r.rid = f.route_id"+
	"inner JOIN airlines al ON r.airline = al.iata"+
	"inner JOIN schedules sc ON sc.flight_id = f.flight_id"+
	"inner JOIN seats sf ON sf.schedule_id =  sc.id"+
	"where r.src_ap=$s_airport_id"+
	"and r.dst_ap=$d_sirport_id"+
	"and sf.class_id = 1"+
	"and DATE(sc.departure_time)>=$starttime"+
	"and DATE(sc.departure_time)<=$endtime"+
	"and sf.remaining_seats>=$seats;"

  queryString = queryString.replace('$starttime',start_date);
  queryString =queryString.replace('$endtime', start_date+2);
  queryString =queryString.replace('$seats',seats);
  queryString =queryString.replace('$class',clas);
  queryString =queryString.replace('$s_airport_id',s_airport_id);
  queryString =queryString.replace('$d_airport_id',d_airport_id);
  connectionPool.query(queryString,function(err,rows, fields){
	 if(!err){
		var result = formated_date(rows);
		console.log(result);
		cb(result);
		
	 }else{
		 console.log("Error in searching");
		 console.log(err);
		 callback(null);
	 } 
  });

}

module.exports = router