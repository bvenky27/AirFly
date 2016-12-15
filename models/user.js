var mysql      = require('mysql');
var conf = require('./db_conf.js');
var logger = require('./logger.js');
var connection = mysql.createConnection({
  host     : conf.host,
  user     : conf.user,
  password : conf.password,
  database : conf.database
});
/*
 Will expect a fields object which contain key value pair need to be stored
*/
function save(fields,cb){
	var cols = "("
	var vals = "VALUES ("
	var fieldsKeys = Object.keys(fields);
	for(var i = 0 ; i < fieldsKeys.length-1; i++){
		cols = cols + fieldsKeys[i]+", ";
		vals =vals+"'"+fields[fieldsKeys[i]]+"', "
	}
	if( fieldsKeys.length > 0){
		cols = cols + fieldsKeys[i];
		vals = vals+"'"+fields[fieldsKeys[i]]+"'";
	}
	cols = cols + ") "
	vals = vals + ") ;"
	var queryString = "INSERT INTO USERINFO "+cols+" "+vals;
	connection.query(queryString,function(err,rows,fields){
		if(err){
			logger.log('info','Query Execution Failed'+err);
			cb(err);
		}else{
			cb(null,rows[0]);
		}
	});
}

function fetchByCols(fields,condition,cb){
	var condition = getTheSqlCondition(condition);
	var selectClause = "select "
	for(var i  = 0 ; i < fields.length-1; i++){
	  selectClause = selectClause + fields[i]+", ";
	}
	if(fields.length > 0){
		selectClause = selectClause+fields[i];
	}
	var finalQuery = selectClause + " from userinfo where "+condition+";";
	logger.log('info','about to execute the Query '+finalQuery);
	console.log('about to execute the Query '+finalQuery);
	connection.query(finalQuery,function(err,rows,fileds){
		if(err){
			logger.log('info','Query Execution Failed '+err);
			console.log('Query Execution Failed '+err);
			cb(err);
		}else{
			cb(null,rows);
		}
	});
}


var exports = {"save":save,"fetchByCols":fetchByCols};
module.exports = exports;
