var alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var base = new BigInteger(58);

var alphabetMap = {}
for (var i = 0; i < alphabet.length; ++i) {
  var chr = alphabet[i];
  alphabetMap[chr] = new BigInteger(i);
}

function toByteArrayUnsigned(num) {
  var result = [];
  var numstr = num.toString();
  
  for (var i = 0; i < numstr.length; ++i) {
    var chr = numstr[i];
    result.push(chr);
  }
  
  return result;
}

function toFloat(input, decimals) {
  if (typeof decimals == 'undefined') {
    decimals = 8;
  }
  return parseFloat(input.toPrecision(decimals));
}

function base58decode(str) {
  var num = new BigInteger(0);
  
  for (var i = 0; i < str.length; ++i) {
    var chr = str[i];
    var bi = alphabetMap[chr];   
    
    if (bi === undefined) {
      throw new Error('Invalid base58 string: ' + str);
    }
    
    num = num.multiply(base).add(bi);
  }
  
  var hex = num.toString(16);
  hex = hex.substr(0, hex.length - 8);
  hex = hex.toLowerCase();
  
  while (hex.length < 40) {
    hex = '0' + hex;
  }
  
  return hex;
}

function swapEndianness(input) {
  var hex = '';
  
  for (var i = 0; i < input.length; i += 2) {    
    hex = input.substr(i, 2) + hex;    
  }
  
  return hex;  
}

function intToHex(input, pad) {
  if (typeof pad == 'undefined') {
    pad = 2;
  }
  
  var hex = input.toString(16);
  for (var i = hex.length; i < pad; ++i) {
    hex = '0' + hex;
  }
  
  hex = swapEndianness(hex);
  
  return hex;
}

function createTx(txs, addr) {
  var transaction = new Object();
  transaction.address = addr;  
  transaction.vin = new Array();
  transaction.amount = 0;
  
  var siglenoverhead = 0;
  
  txs.forEach(function (vout) {
    var vinhex = swapEndianness(vout.txid) + intToHex(vout.vout);
    var amount = parseInt(vout.amount * 100000000);
    transaction.amount += amount;
    transaction.vin.push(vinhex);    
    if (vout.type == 'pubkeyhash') {
      siglenoverhead += 130;
    }
  });
  
  var length = (8 + intToHex(transaction.vin.length).length + transaction.vin.length * 236 + siglenoverhead + 78) / 2;
  var fee = Math.ceil(length / 1000) * 10000;
  var amount = transaction.amount - fee;
  
  var hex = '01000000';
  hex += intToHex(transaction.vin.length);
  transaction.vin.forEach(function (vin) {
    hex += vin;
    hex += '00000000ffffffff';
  });
  
  hex += intToHex(1);
  hex += intToHex(amount, 16);
  hex += '1976a914';
  hex += base58decode(transaction.address);
  hex += '88ac00000000';
  
  var response = new Object();
  response.hex = hex;
  response.total = toFloat(transaction.amount / 100000000);
  response.fee = toFloat(fee / 100000000);
  response.amount = toFloat(amount / 100000000);
  response.recipient = transaction.address;
  response.approxlength = length;
  response.dust = amount < 5460;
  
  return response;
}

angular.module('redeemTxs', [])
  .controller('TxsController', ['$scope', '$http', function ($scope, $http) {
    $scope.address = '1Pa6zyqnhL6LDJtrkCMi9XmEDNHJ23ffEr';
    $scope.status = '';    
    $scope.minconf = 1;
    $scope.maxconf = 9999999;
    $scope.loading = false;
    $scope.outputs = [];    
    $scope.redeemTx = {};
    
    $scope.build = function build() {
      console.log('log building ... outputs: ' + $scope.outputs.length);
      $scope.redeemTx = createTx($scope.outputs, $scope.address);
    };
    
    $scope.reset = function reset() {
      console.log('reset');
      $scope.status = '';
      $scope.outputs = [];    
      $scope.redeemTx = {};
    };
    
    $scope.fetch = function fetch() {
      console.log('loading');
      if ($scope.loading) {
        return;
      }
      
      $scope.loading = true;
      $scope.redeemTx = '';
      $scope.status = 'Loading...';
      
      $http.get('http://api.bitwatch.co/listunspent/' + this.address + '?verbose=0&minconf=' + this.minconf + '&maxconf=' + this.maxconf).then(function (res) {        
        console.log('status', res.status);
        
        if (res.status == 200) {
          $scope.loading = false;
          $scope.add(res.data.result);          
          console.log('has', $scope.outputs.length);          
        } else {
          $scope.loading = false;
        }
      });
    };
    
    $scope.add = function add(obj) {    
      var count = 0;      
      angular.forEach(obj, function (objA) {
        var found = false;
        
        angular.forEach($scope.outputs, function (objB) {
          if (angular.equals(objA, objB)) {
            found = true;            
          }
        });
        
        if (!found) {
          $scope.outputs.push(objA);
          count++;
        }
      });
      
      $scope.build();
      $scope.status = count + ' new transactions added.';
    };
    
    $scope.remove = function remove(idx) {
      var vout = $scope.outputs[idx].txid + ':' + $scope.outputs[idx].vout;
      $scope.outputs.splice(idx, 1);
      $scope.build();
      $scope.status = 'Removed ' + vout + '.';     
    };
    
    $scope.hasData = function hasData() {
      return $scope.outputs.length > 0;
    };
 }]);