function selectParser(selectString){
  var result = [];
  if(typeof selectString == 'string'){
     var cols  = selectString.split(",");
	 return cols;
  }
}
module.exports = selectParser;