module.exports.devolverMock = function (res, id) { 
    if(id == 1){
    	res.send([
		    {
		        "temp_diurna": 25,
		        "estado_dia": "01d",
		        "temp_nocturna": 30,
		        "estado_noche": "01n"
		    },
		    {
		        "temp_diurna": 5.5,
		        "estado_dia": "02d",
		        "temp_nocturna": 8,
		        "estado_noche": "02n"
		    },
		    {
		        "temp_diurna": 1.2,
		        "estado_dia": "10d",
		        "temp_nocturna": 8.5,
		        "estado_noche": "10n"
		    },
		    {
		        "temp_diurna": 0,
		        "estado_dia": "13d",
		        "temp_nocturna": 0,
		        "estado_noche": "13n"
		    },
		    {
		        "temp_diurna": 11.3,
		        "estado_dia": "09d",
		        "temp_nocturna": 15.7,
		        "estado_noche": "09n"
		    }
		]);
    } else if (id == 2) {
    	res.send([
		    {
		        "temp_diurna": 25,
		        "estado_dia": "03d",
		        "temp_nocturna": 30,
		        "estado_noche": "03n"
		    },
		    {
		        "temp_diurna": 5.5,
		        "estado_dia": "04d",
		        "temp_nocturna": 8,
		        "estado_noche": "04n"
		    },
		    {
		        "temp_diurna": 1.2,
		        "estado_dia": "11d",
		        "temp_nocturna": 8.5,
		        "estado_noche": "11n"
		    },
		    {
		        "temp_diurna": 5.4,
		        "estado_dia": "50d",
		        "temp_nocturna": 10,
		        "estado_noche": "50n"
		    },
		    {
		        "temp_diurna": 11.3,
		        "estado_dia": "10d",
		        "temp_nocturna": 15.7,
		        "estado_noche": "10n"
		    }
		]);
    }
};