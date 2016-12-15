var mysql  = require('mysql');
var conf = require('./db_conf.js');
var logger = require('./logger.js');
var connectionPool = require('./connectionPool.js');
var connection = mysql.createConnection({
  host     : conf.host,
  user     : conf.user,
  password : conf.password,
  database : conf.database
});
function book(tickets,passengers_data,num_fare_data,cb){
	var insert_statements = []
	for(var i = 0 ; i < tickets.length; i++){
		insert_statements.push(modelHelper.getInsertStatement("tickets", tickets[i]));
	}
	for(var i = 0 ; i < passengers_data.length; i++){
		insert_statements.push(modelHelper.getInsertStatement("passengers", passengers_data[i]));
	}
	for(var i = 0 ; i < num_fare_data.length; i++){
		insert_statements.push(get_update_statement(num_fare_data[i],passengers_data.length));
	}
	book_tickets(insert_statements,cb);
}

function get_update_statement(fields,val){
	var str = "UPDATE seats SET remaining_seats = remaining_seats - "+val+" where class_id="+fields["CLASS_ID"]+" and schedule_id="+fields["SCHEDULE_ID"]+";";
	return str;
}

function book_tickets(insert_statements,cb){
	var i = 0 ;
	connection.beginTransaction(function(err){
		if(err){
			cb(false);
		}else{
			recursive();
		}
	})
	function recursive(){
		if( i >= insert_statements.length){
			connection.commit(function(err){
				if(err){
					cb(false);
				}else{
					cb(true);
				}
			})
			return;
		}

		connection.query(insert_statements[i],function(err,rows){
			if(err){
				console.log("error--->>"+err);
			connection.rollback(function(err){
				cb(false);
			})
			}
			else{
				i++;
				recursive();
			}
		});
	}
}
function cancel(booking_id,cb){
	var condition = ["booking_id","$eq",booking_id];
	var select_sql_stmt = modelHelper.getSelecStatement('tickets',["SCHEDULE_ID","CLASS_ID"],condition);
	var select_sql_stmt_2 = modelHelper.getSelecStatement('passengers',["count(*) as cont"],condition);
	cancel_tickets([select_sql_stmt,select_sql_stmt_2,get_status_change_update_statement(booking_id)],cb);

}
function get_cancel_update_statement(schedule_id, class_id, passengers){
     var str = "UPDATE seats SET remaining_seats = remaining_seats + "+passengers+" where class_id="+class_id+" and schedule_id="+schedule_id+";";
	return str;
}
function get_status_change_update_statement(booking_id){
   var str = "UPDATE reservations SET status='Cancelled' where reservation_id='"+booking_id+"';";
   return str;
}
function cancel_tickets(insert_statements,callback){
	var i = 0 ;
	var schedule_id = ""
	var class_id = ""
	var passengers_count;
	connection.beginTransaction(function(err){
		if(err){
			callback(false);
		}else{
			stm1(function(boo1){
				if(!boo1){
					connection.rollback(function(err){
				        callback(false);
			     })
				 return;
				}
				stmt2(function(boo2){
					if(!boo2){
					connection.rollback(function(err){
				        callback(false);
			     })
				 return;
				}
				stmt3(function(boo3){
					if(!boo3){
						connection.rollback(function(err){
				        callback(false);});
				        return;
					}
					stmt4(function(boo4){
						if(!boo4){
							connection.rollback(function(err){
				                callback(false);});
						  return;
						}
						connection.commit(function(err){
						if(err){
							callback(false);
							return;
						}
						callback(true);
					});
					})
				});
				});
			});
		}
	})
	function stm1(cb){
		console.log(insert_statements[0]);
		connection.query(insert_statements[0],function(err,rows){
			if(err){
				cb(false);
				return;
			}
			schedule_id = rows[0]["SCHEDULE_ID"];
			class_id = rows[0]["CLASS_ID"];
			cb(true);
		})
	}
	function stmt2(cb){
		console.log(insert_statements[1]);
		connection.query(insert_statements[1],function(err,rows){
			if(err){
				cb(false);
				return;
			}
			passengers_count = rows[0]["cont"];
			cb(true);
		});
	}
	function stmt3(cb){
		var update_stmt = get_cancel_update_statement(schedule_id,class_id,passengers_count);
		console.log(update_stmt);
		connection.query(update_stmt,function(err,rows){
			if(err){
				cb(false);
			}else{
				cb(true);
			}
		})
	}

	function stmt4(cb){
		console.log(insert_statements[2]);
		connection.query(insert_statements[2],function(err,rows){
			if(err){
				cb(false);
				return;
			}
			cb(true);
		});
	}
}
module.exports = {"book":book,"cancel":cancel}