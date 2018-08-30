var express = require('express');
var https = require('https');

var app = express();

const API_KEY = "&APPID=5516ab386ad112c122c857849a9555a3";
const unidad_temp = '&units=metric'


const horarios_diurnos = ["12:00:00","15:00:00","18:00:00","21:00:00"];
const horarios_nocturnos = ["00:00:00","03:00:00","06:00:00","09:00:00"];


const id_ciudad_Buenos_Aires = 3433955;



app.get('/', function (req, res) {
  	res.send('Hello World!');
});

app.get('/weather/:city_id', function(req, res){
	var options = {
		host :  'api.openweathermap.org',
		port : 443,
		path : '/data/2.5/forecast?id=' + req.params.city_id + API_KEY + unidad_temp,
		method : 'GET'
	}



	var getReq = https.request(options, function(result) {
		    
	    result.on('data', function(data) {
	    	data_json = JSON.parse(data);
	    	
	    	//Este arreglo contendra las temperaturas para el dia y la noche obtenidas en promedio
	    	//El formato sera [dia1DIURNA,dia1NOCTURNA,.......,dia5DIURNA,dia5NOCTURNA]
	    	var temperaturas_diurna_y_nocturna_promedio_por_dia = [];
	    	//Este arreglo tendra las temperaturas que corresponden a las franjas de 00hs a 09hs
	    	var temperaturas_nocturnas = [];
	    	//Este arreglo tendra las temperaturas que corresponden a las franjas de 12hs a 21hs
	    	var temperaturas_diurnas = [];
	    	
	    	//Tomo el primer dia de la muestra para entrar en el loop
	    	var dia_analizado = (data_json.list[0].dt_txt);
	    	dia_analizado = (dia_analizado.match(/[0-9]*-[0-9]*-[0-9]*/g)).toString();

	    	var cantidad_de_elementos = data_json.cnt;
	    	
	    	for (var j = 0; j < cantidad_de_elementos; j++) {
	    		
	    		var dia_cambio = false;
	    		var es_ultimo = false;

	    		if (j == (cantidad_de_elementos-1)) es_ultimo = true;

	    		var elemento = data_json.list[j];
	    		var fecha_y_hora = elemento.dt_txt;
	    		
	    		//Obtengo el dia a partir del parametro "dt_txt" para saber cuando cambia
	    		var dia_nuevo = fecha_y_hora;
	    		dia_nuevo = (dia_nuevo.match(/[0-9]*-[0-9]*-[0-9]*/g)).toString();

	    		//Obtengo el horario que me da la API para saber si corresponde a una franja u otra.
	    		var horario = fecha_y_hora;
	    		horario = horario.match(/[0-9]*:[0-9]*:[0-9]*/g).toString();

	    		
	    		//Si el dia no cambio puedo hacer el analisis
	    		if (dia_analizado.localeCompare(dia_nuevo) != 0) dia_cambio = true;
    			
    			if(dia_cambio || es_ultimo){
    				var temperatura_diurna_promedio = 0;
    				var temperatura_nocturna_promedio = 0;
    				
    				//ESTA FORMA DE CALCULAR PROMEDIO ESTA MAL, HABRIA QUE HACER UNA FUNCION
    				for (var k = 0; k < temperaturas_diurnas.length; k++) {
    					temperatura_diurna_promedio += temperaturas_diurnas[k];
    				}
    				for (var l = 0; l < temperaturas_nocturnas.length; l++) {
    					temperatura_nocturna_promedio += temperaturas_nocturnas[l];
    				}
    				temperatura_diurna_promedio = temperatura_diurna_promedio/(temperaturas_diurnas.length);
    				temperatura_nocturna_promedio = temperatura_nocturna_promedio/(temperaturas_nocturnas.length);
					
    				//AGREGO LOS VALORES PROMEDIOS AL ARRAY CON LOS 10 VALORES FINALES
					temperaturas_diurna_y_nocturna_promedio_por_dia.push(temperatura_diurna_promedio);
					temperaturas_diurna_y_nocturna_promedio_por_dia.push(temperatura_nocturna_promedio);    				


					temperaturas_diurnas = [];
					temperaturas_nocturnas = [];
    				dia_analizado = dia_nuevo;
    				dia_cambio = false;
    				es_ultimo = false;
    			}
    			
    			//Agrego la temperatura de ese dia y ese horario al arreglo de la franja que 
    			//corresponde
    			if (horarios_diurnos.includes(horario)) {
    				temperaturas_diurnas.push(elemento.main.temp);
    			}
    			else if (horarios_nocturnos.includes(horario)){
    				temperaturas_nocturnas.push(elemento.main.temp);
    			}
			}
	    	
			//Se devuelve el arreglo con el formato de dos temperaturas por dia
	        res.send( temperaturas_diurna_y_nocturna_promedio_por_dia );
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