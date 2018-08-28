var express = require('express');
var app = express();

const API_KEY = "5516ab386ad112c122c857849a9555a3";

app.get('/', function (req, res) {
  	res.send('Hello World!');
});

app.get('/cities', function(req, res){

})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});