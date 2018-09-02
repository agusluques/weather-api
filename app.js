var express = require('express');
var https = require('https');
var fs = require('fs');
var _ = require('underscore');

var app = express();

// se usa para levantar el archivo solo 1 vez y guardarlo en memoria del servidor
var archivo_ciudades;

const API_KEY = "&APPID=5516ab386ad112c122c857849a9555a3";
const unidad_temp = '&units=metric'

const horarios_diurnos = ["00:00:00","03:00:00","06:00:00","09:00:00"];
const horarios_nocturnos = ["12:00:00","15:00:00","18:00:00","21:00:00"];
const cantidad_de_dias = 5;
//id de la ciudad de Buenos Aires, Capital Federal.
const id_ciudad_Buenos_Aires = 3433955;
const codigo_ciudad_no_encontrada = 404;

//Funcion auxiliar que calcula el promedio de los elementos de un arreglo.
//Input: arreglo con valores.
//Output: promedio de los valores que componen el arreglo.
function calcularPromedio(arreglo) {
	var promedio = 0;
	var sumaValores = 0;
	var cantidad = arreglo.length;
	
	for (var i = 0; i < cantidad; i++) {
    	 sumaValores += arreglo[i];
    }

    return (sumaValores/cantidad);
}

function determinarEstado(codigoDeEstado) {
	if (isNaN(codigoDeEstado)) return "undefined";

	if(codigoDeEstado < 300){
		return "Thunderstorm"; //tormenta
	} else if (codigoDeEstado < 500){
		return "Drizzle"; //llovizna
	} else if (codigoDeEstado < 600){
		return "Rain"; //lluvia
	} else if (codigoDeEstado < 700){
		return "Snow"; //nieve
	} else if (codigoDeEstado < 800){
		return "Atmosphere"; //neblina
	} else if (codigoDeEstado == 800){
		return "Clear"; //despejado
	}
	return "Clouds"; //nublado
}

function hacerJsonClima(datos, estados){
	var iterador_datos = 0;
	var resultado = [
		{"temp_diurna":"","estado_dia":"","temp_nocturna":"","estado_noche":""},
		{"temp_diurna":"","estado_dia":"","temp_nocturna":"","estado_noche":""},
		{"temp_diurna":"","estado_dia":"","temp_nocturna":"","estado_noche":""},
		{"temp_diurna":"","estado_dia":"","temp_nocturna":"","estado_noche":""},
		{"temp_diurna":"","estado_dia":"","temp_nocturna":"","estado_noche":""}
		];
	
	for (var i = 0; i < cantidad_de_dias; i++) {
		resultado[i].temp_diurna = datos[iterador_datos];
		resultado[i].estado_dia = determinarEstado(estados[iterador_datos]);
		iterador_datos++;
		resultado[i].temp_nocturna = datos[iterador_datos];
		resultado[i].estado_noche = determinarEstado(estados[iterador_datos]);
		iterador_datos++;
	}
	return resultado;
}


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
	    	//Si el codigo de ciudad no es correcto, se informa.
	    	if (data_json.cod == codigo_ciudad_no_encontrada) res.send("Ciudad invalida o no encontrada!");
	    	
	    	//Este arreglo contendra las temperaturas para el dia y la noche obtenidas en promedio
	    	//El formato sera [dia1DIURNA,dia1NOCTURNA,.......,dia5DIURNA,dia5NOCTURNA]
	    	var temperaturas_diurna_y_nocturna_promedio_por_dia = [];
	    	var estados_clima_diurnos_y_nocturnos_promedio_por_dia = [];
	    	//Este arreglo tendra las temperaturas que corresponden a las franjas de 00hs a 09hs
	    	var temperaturas_nocturnas = [];
	    	//Este arreglo tendra las temperaturas que corresponden a las franjas de 12hs a 21hs
	    	var temperaturas_diurnas = [];
			//Aca almacenamos los estados del clima
	    	var estados_del_clima_diurnos = [];
	    	var estados_del_clima_nocturnos = [];
	    	
	    	//Tomo el primer dia de la muestra para entrar en el loop
	    	var dia_analizado = (data_json.list[0].dt_txt);
	    	dia_analizado = (dia_analizado.match(/[0-9]*-[0-9]*-[0-9]*/g)).toString();

	    	var cantidad_de_elementos = data_json.cnt;
	    	var dias_procesados = 0;
	    	
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
	    		
	    		//Detecto si el dia cambio o no
	    		if (dia_analizado.localeCompare(dia_nuevo) != 0) {
	    			dia_cambio = true;
	    			dias_procesados++;
	    		}
	    		
    			if(dia_cambio || es_ultimo){
    				var temperatura_diurna_promedio = 0;
    				var temperatura_nocturna_promedio = 0;

    				var estado_del_clima_diurno_promedio = 0;
    				var estado_del_clima_nocturno_promedio = 0;

    				//Esto es serio candidato al refactor pero tiempos desesperados requieren medidas desesperadas ?)
    				if(es_ultimo){
    					//Agrego la temperatura de ese dia y ese horario al arreglo de la franja que 
    					//corresponde
    					if (horarios_diurnos.includes(horario)) {
    						temperaturas_diurnas.push(elemento.main.temp);
    						estados_del_clima_diurnos.push(elemento.weather[0].id);
    					} else if (horarios_nocturnos.includes(horario)){
    						temperaturas_nocturnas.push(elemento.main.temp);
    						estados_del_clima_nocturnos.push(elemento.weather[0].id);
    					}
    				}
    				
    				//Calculo el promedio diurno y nocturno con los valores obtenidos para cada franja.
    				temperatura_diurna_promedio = Math.round( calcularPromedio(temperaturas_diurnas) * 10) / 10;
    				temperatura_nocturna_promedio = Math.round( calcularPromedio(temperaturas_nocturnas)* 10) / 10;


    				//Calculo del promedio de estado climatico para franja diurna y nocturna.
    				estado_del_clima_diurno_promedio = calcularPromedio(estados_del_clima_diurnos);
    				estado_del_clima_nocturno_promedio = calcularPromedio(estados_del_clima_nocturnos);
    				
    				
    				//Agrego ambos promedios al resultado final.
					temperaturas_diurna_y_nocturna_promedio_por_dia.push(temperatura_diurna_promedio);
					temperaturas_diurna_y_nocturna_promedio_por_dia.push(temperatura_nocturna_promedio);    				
					
					estados_clima_diurnos_y_nocturnos_promedio_por_dia.push(estado_del_clima_diurno_promedio);
					estados_clima_diurnos_y_nocturnos_promedio_por_dia.push(estado_del_clima_nocturno_promedio);

					//Reset de variables para que empiece el nuevo calculo.
					temperaturas_diurnas = [];
					temperaturas_nocturnas = [];

					estados_del_clima_nocturnos = [];
					estados_del_clima_diurnos = [];
    				
    				dia_analizado = dia_nuevo;
    				
    				dia_cambio = false;
    				es_ultimo = false;
    			}
    			
    			//Limito siempre a 5 dias analizados, esto es por la variabilidad de los
    			//datos entregados en el Json al momento de hacer la request.
    			if (dias_procesados == cantidad_de_dias) break;

    			//Agrego la temperatura de ese dia y ese horario al arreglo de la franja que 
    			//corresponde
    			if (horarios_diurnos.includes(horario)) {
    				temperaturas_diurnas.push(elemento.main.temp);
    				estados_del_clima_diurnos.push(elemento.weather[0].id);
    			} else if (horarios_nocturnos.includes(horario)){
    				temperaturas_nocturnas.push(elemento.main.temp);
    				estados_del_clima_nocturnos.push(elemento.weather[0].id);
    			}
			}
	    	
	    	//convierto las temperaturas a formato JSON
	    	var datos_de_salida = hacerJsonClima(temperaturas_diurna_y_nocturna_promedio_por_dia, estados_clima_diurnos_y_nocturnos_promedio_por_dia);
			
			//Se devuelve el JSON con el formato de dos temperaturas y dos estados por dia
	        res.send( datos_de_salida );
	    });
	});

	getReq.end();
	getReq.on('error', function(err){
		console.log("Error: ", err);
	});	
})

app.get('/cities', function(req, res){

	var filtro = req.query.filter;

	var filteredCities = archivo_ciudades.filter(el => (el.name + ', ' + el.country).toLowerCase().includes(filtro.toLowerCase()))
							.sort((a,b) => a.name + ', ' + a.country < b.name + ', ' + b.country ? -1 : 1)
							.map(function(x) { return {id: x.id, nombre: x.name + ', ' + x.country}; });

	filteredCities = _.uniq(filteredCities, function(p){ return p.nombre; } );

	res.send(filteredCities);
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, function () {
  console.log('Servidor escuchando en el puerto ' + PORT + '...');
  fs.readFile('./assets/city.list.json', 'utf8', function (err, data) {
		if (err) throw err;
		archivo_ciudades = JSON.parse(data);

		archivo_ciudades = archivo_ciudades.filter(el => el.country = 'AR');
		console.log('Archivo cargado y filtrado por ciudades de Argentina.');
	});
});