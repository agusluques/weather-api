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
	    	data_json = JSON.parse(data);

	    	/*fechas = [];
	    	dias = 0, i = 0;
	    	fechas[dias] = Date(data_json.list[i].dt_text + "UTC").setHours(0,0,0,0);

	    	console.log(str(fechas[dias]));
	    	while (fechas[dias] == new Date(data_json.list[i].dt_text + "UTC").setHours(0,0,0,0)){
	    		

				console.log("temp dia "+ str(new Date(data_json.list[i].dt_text + "UTC")) + " : " + data_json.list[i].main.temp);
	    		
	    		i++;
	    	}*/

	        res.send( data_json );
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, function () {
  console.log('Runing on ' + PORT + '...');
});