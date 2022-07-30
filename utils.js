const { BN } = require('bn.js');
const { JsSignatureProvider, PrivateKey } = require('zswjs/dist/zswjs-jssig');      // development only

function privateToPublic(privKey){
  return PrivateKey.fromString(privKey).getPublicKey().toString();
}
function parseAuth(p){
  if(Array.isArray(p)){
    return p.map(x=>parseAuth(x))
  }else if(typeof p==='object'){
    return [p];
  }
  const commas = p.split(",");
  if(commas.length>1){
    return commas.map(x=>parseAuth(x)[0]);
  }

  let x = p.split(":");
  if(x.length===2){
    return [{
      actor: x[0],
      permission: x[1],
    }]
  }
  x = p.split("@");
  if(x.length===2){
    return [{
      actor: x[0],
      permission: x[1],
    }]
  }

}


function addNativeCreditSymbol(x){
  return parseFloat((x+"").split(" ").filter(x=>x.trim().length)[0]).toFixed(4)+" "+"ZSWCC";
}


function uuidToZswItemId(uuidString) {
  const part = uuidString.substring(26, 36)
  const b1 = parseInt(part.substring(0, 2), 16);
  const b2 = parseInt(part.substring(2, 4), 16);
  const b3 = parseInt(part.substring(4, 6), 16);
  const b4 = parseInt(part.substring(6, 8), 16);
  const b5 = parseInt(part.substring(8, 10), 16);
  return (((b1 << 24) | (b2 << 16) | (b3 << 8) | b4) >>> 0) * 0x100 + b5;
}

function uuidToZsw64BitId(uuidString) {
  return new BN(uuidString.substring(19, 23) + uuidString.substring(24, 36), 16).toString()
}
function uuidToUint256Id(uuidString) {
  return new BN(uuidString.replace(/-/g, ""), 16).toString()

}
module.exports = {
  parseAuth,
  addNativeCreditSymbol,
  privateToPublic,
  uuidToUint256Id,
  uuidToZsw64BitId,
  uuidToZswItemId,
}