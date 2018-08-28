var express = require('express');
var https = require('https');

var app = express();

const API_KEY = "5516ab386ad112c122c857849a9555a3";


app.get('/', function (req, res) {
  	res.send('Hello World!');
});

app.get('/weather/:city_id', function(req, res){
	var options = {
		host :  'api.openweathermap.org',
		port : 443,
		path : '/data/2.5/forecast?id=' + req.params.city_id + '&APPID=' + API_KEY + '&units=metric',
		method : 'GET'
	}

	var getReq = https.request(options, function(result) {
		    
	    result.on('data', function(data) {
	        res.send( JSON.parse(data) );
	    });
	});

	getReq.end();
	getReq.on('error', function(err){
		console.log("Error: ", err);
	});	
})

app.get('/cities', function(req, res){
	res.send('Todas las ciudades');
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});