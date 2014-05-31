var bunyan = require('bunyan');
var restify = require('restify');
var bitcoin = require('bitcoin');
var fs = require('fs');

var port = 0;

var client = new bitcoin.Client({
  host: 'empty',
  port: 0,
  user: 'empty',
  pass: 'empty',
  timeout: 0
});

function listunspent(req, res, next) {  
  var address = req.params.addr;
  var verbose = 0;
  var minconf = 1;
  var maxconf = 9999999;
  var maxreqsigs = 1;
  
  if (typeof req.query.verbose == 'string') {
    verbose = parseInt(req.query.verbose);
  }
  
  if (typeof req.query.minconf == 'string') {
    minconf = parseInt(req.query.minconf);
  }
  
  if (typeof req.query.maxconf == 'string') {
    maxconf = parseInt(req.query.maxconf);
  }
  
  if (typeof req.query.maxreqsigs == 'string') {
    maxreqsigs = parseInt(req.query.maxreqsigs);
  }
  
  var params = [{
    method: 'listallunspent',
    params: [address, verbose, minconf, maxconf, maxreqsigs]
  }];
  
  client.cmd(params, function (err, result) {
    var response = new Object();
    response.status = 200;
    response.method = 'listunspent';
    
    response.params = new Object();
    response.params.address = address;
    response.params.verbose = verbose;
    response.params.minconf = minconf;
    response.params.maxconf = maxconf;
    response.params.maxreqsigs = maxreqsigs;
    
    if (err) {
      console.log(err);
      response.result = err;
      response.status = 400;
    } else {
      response.result = result;
    }
    
    response.timestamp = Math.round(Date.now() / 1000);
    res.send(response);
    next();
  });
}

function getbalance(req, res, next) {
  var address = req.params.addr;
  var minconf = 1;
  var maxreqsigs = 1;
    
  if (typeof req.query.minconf == 'string') {
    minconf = parseInt(req.query.minconf);
  }
    
  if (typeof req.query.maxreqsigs == 'string') {
    maxreqsigs = parseInt(req.query.maxreqsigs);
  }
  
  var params = [{
    method: 'getallbalance',
    params: [address, minconf, maxreqsigs]
  }];
  
  client.cmd(params, function (err, result) {
    var response = new Object();
    response.status = 200;
    response.method = 'getbalance';
    
    response.params = new Object();
    response.params.address = address;
    response.params.minconf = minconf;
    response.params.maxreqsigs = maxreqsigs;
    
    if (err) {
      console.log(err);
      response.result = err;
      response.status = 400;
    } else {
      response.result = result;
    }
    
    response.timestamp = Math.round(Date.now() / 1000);
    res.send(response);
    next();
  });
}

function listtransactions(req, res, next) {  
  var address = req.params.addr;
  var verbose = 0;
  var skip = 0;
  var count = 100;
  
  if (typeof req.query.verbose == 'string') {
    verbose = parseInt(req.query.verbose);
  }
  
  if (typeof req.query.skip == 'string') {
    skip = parseInt(req.query.skip);
  }
  
  if (typeof req.query.count == 'string') {
    count = parseInt(req.query.count);
  }
  
  var params = [{
    method: 'listalltransactions',
    params: [address, verbose, skip, count]
  }];
  
  client.cmd(params, function (err, result) {
    var response = new Object();
    response.status = 200;
    response.method = 'listtransactions';
    
    response.params = new Object();
    response.params.address = address;
    response.params.verbose = verbose;
    response.params.skip = skip;
    response.params.count = count;
    
    if (err) {
      console.log(err);
      response.result = err;
      response.status = 400;
    } else {
      response.result = result;
    }
    
    response.timestamp = Math.round(Date.now() / 1000);
    res.send(response);
    next();
  });
}

function pushtx(req, res, next) {
  var hex = req.params.hex;
  
  var params = [{
    method: 'sendrawtransaction',
    params: [hex]
  }];
  
  client.cmd(params, function (err, result) {
    var response = new Object();
    response.status = 200;
    response.method = 'pushtx';
    
    response.params = new Object();
    response.params.hex = hex;
    
    if (err) {
      console.log(err);
      response.result = err;
      response.status = 400;
    } else {
      response.result = result;
    }
    
    response.timestamp = Math.round(Date.now() / 1000);
    res.send(response);
    next();
  });
}

// Init
var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.gzipResponse());

// Process website requests
server.get('/redeem', function(req, res, next) {
  fs.readFile('./web/redeem.html', function (err, data) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', data.length);
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      res.end(data);
    }
  });
  next();
});

server.get('/app.js', function(req, res, next) {
  fs.readFile('./web/js/app.js', function (err, data) {
    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Content-Length', data.length);
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      res.end(data);
    }
  });
  next();
});

server.get('/biginteger.js', function(req, res, next) {
  fs.readFile('./web/js/biginteger.js', function (err, data) {
    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Content-Length', data.length);
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      res.end(data);
    }
  });
  next();
});

// Process API requests
server.get('/listunspent/:addr', listunspent);
server.get('/getbalance/:addr', getbalance);
server.get('/listtransactions/:addr', listtransactions);
server.get('/pushtx/:hex', pushtx);

// Start server
server.listen(port, function () {
  console.log('[' + Date.now() + '] %s listening at %s', server.name, server.url);
});

// Log
server.on('after', restify.auditLogger({
  log: bunyan.createLogger({
    name: 'audit',
    streams: [{
        path: '/home/someusername/somepath/logs/redeem_txs.log'
    }]
  })
}));
