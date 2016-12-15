var logger = require('/logger.js');
function getInsertStatement(tablename, fields){ 
	var cols = "("
	var vals = "VALUES ("
	var fieldsKeys = Object.keys(fields);
	for(var i = 0 ; i < fieldsKeys.length-1; i++){
		cols = cols + fieldsKeys[i]+", ";
		if(typeof fieldsKeys[i] == 'string'){
		    vals =vals+"'"+fields[fieldsKeys[i]]+"', "
		}else{
		    vals =vals+fields[fieldsKeys[i]]+", "
		}
		
	}
	if( fieldsKeys.length > 0){
		cols = cols + fieldsKeys[i];
		if(typeof fieldsKeys[i] == 'string'){
		   vals = vals+"'"+fields[fieldsKeys[i]]+"'";
		}else{
		   vals = vals+fields[fieldsKeys[i]]
		}
	}
	cols = cols + ") "
	vals = vals + ") ;"
	var queryString = "INSERT INTO "+tablename+" "+cols+" "+vals;
	logger.log('info','Inserted String '+queryString);
	return queryString;
}

function getTheSqlCondition(condition){
   var connectors = {"$AND":{"type":"binary","const":"AND"},"$OR":{"type":"binary","const":"OR"}};
   var operators = {"$gt":{"const":">"},"$gte":{"const":">="},"$lt":{"const":"<"},"$lte":{"const":"<="},"$eq":{"const":"="}};
   if(condition instanceof Array){
	   var connector = condition[0];
	   if(connectors[connector]){
		   return "( "+getTheSqlCondition(condition[1])+ " "+connectors[connector]["const"]+" "+getTheSqlCondition(condition[2])+" )"
	   }else{
		 var key = condition[0];
		 var operator = condition[1];
		 var value = condition[2];
		 var finalStr = key+"";
		 finalStr =finalStr + operators[operator]["const"];
		 if(typeof value == 'string'){
			 finalStr = finalStr + "'"+value+"'"
		 }
		 else{
			 finalStr = finalStr +value;
		 }
		 return finalStr;
	   }
   }
}

function getSelecStatement(tablename,fields,condition,offset,limit){
	var condition = getTheSqlCondition(condition);
	var selectClause = "select "
	for(var i  = 0 ; i < fields.length-1; i++){
	  selectClause = selectClause + fields[i]+", ";
	}
	if(fields.length > 0){
		selectClause = selectClause+fields[i];
	}
	console.log("limit param"+limit);
	console.log("offset param"+offset);
	var condStr = "";
	if(condition){
		condStr = "where "+condition;
	}
	var limitStr = "";
	if(!(limit === null || typeof limit === 'undefined')){
		limitStr = "limit "+limit;
	}
	var offsetStr = "";
	if(!(offset === null || typeof offset === 'undefined')){
		offsetStr = "offset "+offset;
	}
	var finalQuery = selectClause + " from "+tablename+" "+condStr+" "+limitStr+" "+offsetStr+" ;"
	logger.log('info','about to execute the Query '+finalQuery);
	//console.log('info','about to execute the Query '+finalQuery);
	return finalQuery;
}

function save_bulk(connection,insert_stmts,cb,batchSize){
	if(!batchSize){
		batchSize = 200;
	}
	var i = 0;
	var finalResult = {};
	var start = 0;
	function recursive(){
		if(start >= insert_stmts.length){
			cb(finalResult);
			return;
		}
		save(connection,insert_stmts, start, batchSize, finalResult,function(){
			start = start + batchSize;
			console.log("On going..");
			recursive();
		});
	}
	recursive();
}
function save(connection,insert_stmts,start,batchSize,finalResult,cb){
	var len = (insert_stmts.length > start+batchSize)?start+batchSize:insert_stmts.length;
	var res_count = 0;
	console.log("start "+start);
	console.log("len "+len);
	for(var i = start ; i < len; i++){
		(function(x){
			//console.log(insert_stmts[0]);
			connection.query(insert_stmts[x],callback);
			
			function callback(err,rows){
				if(err){
					console.log("found error -->>"+err);
					return;
				}
				if(start == 100){
					//console.log("final Callback "+res_count);
				}
				//console.log("final Callback");
				res_count = res_count+1;
				finalResult[x] = rows["insertId"];
				if(res_count >= (len-start)){
					cb();
					return;
				}
				
			}
		})(i)
	}
}

module.exports = {"getSelecStatement":getSelecStatement, "getTheSqlCondition":getTheSqlCondition, "getInsertStatement":getInsertStatement,"save_bulk":save_bulk};
