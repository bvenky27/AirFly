var bcrypt   = require('bcrypt-nodejs');
function genHash(val){
   return bcrypt.hashSync(val, bcrypt.genSaltSync(8), null);
}

function compHash(hash,val){
  return bcrypt.compareSync(val, hash);
}
var exports = {"hash":genHash,"compHash":compHash}
module.exports = exports;