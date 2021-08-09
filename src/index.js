const fetch = require('node-fetch');
const Influx = require('influx')

const client = new Influx.InfluxDB({
    database: process.env.INFLUXDB_DATABASE,
    host: process.env.INFLUXDB_HOST,
    port: process.env.INFLUXDB_PORT ?? 8086,
    username: process.env.INFLUXDB_USERNAME ?? '',
    password: process.env.INFLUXDB_PASSWORD ?? ''
});

//console.log(process.env);
loop();
setInterval(loop, process.env.LOOP_MINS * 60 * 1000);


/**
 * Main loop
 */
async function loop() {
    let weather = await lookupWeather(process.env.WEATHER_LAT, process.env.WEATHER_LON, process.env.WEATHER_KEY);
    sendToInfluxDb(weather);
}


async function lookupWeather(lat, lon, key) {
    let body = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon +'&appid=' + key + '&units=metric');
    let weather = await body.json();
    console.log(weather);
    return weather;
}

async function sendToInfluxDb(weather) {
    client.writePoints([{
        measurement: 'weather',
        fields: {
            temp: weather.main.temp,
            tempMin: weather.main.temp_min,
            tempMax: weather.main.temp_max,
            tempFeelsLike: weather.main.feels_like,
            pressure: weather.main.pressure,
            humidity: weather.main.humidity,
            visibility: weather.visibility,
            windSpeed: weather.wind.speed,
            windDirection: weather.wind.deg,
            clouds: weather.clouds.all,
            weather: weather.weather[0].main,
            description: weather.weather[0].description,
            rain1Hour: weather.rain && weather.rain['1h'] ? weather.rain['1h'] : 0,
            rain3Hour: weather.rain && weather.rain['3h'] ? weather.rain['3h'] : 0,
            snow1Hour: weather.snow && weather.snow['1h'] ? weather.snow['1h'] : 0,
            snow3Hour: weather.snow && weather.snow['3h'] ? weather.snow['3h'] : 0,
        },
        tags: {
            id: weather.id,
            name: weather.name,
        },
        timestamp: weather.dt * 1000 * 1000 * 1000
    }]);
}

