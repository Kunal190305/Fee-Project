const cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    api_key = 'a1bcad72632bcf38f42c70922d84d180',  // Consider storing securely in production
    currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
    fiveDaysForecastCard = document.querySelector('.day-forecast'),
    aqiCard = document.querySelectorAll('.highlights .card')[0],
    sunriseCard = document.querySelectorAll('.highlights .card')[1],
    humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibilityVal'),
    windSpeedVal = document.getElementById('windSpeedVal'),
    feelsVal = document.getElementById('feelsVal'),
    hourlyForecastContainer = document.querySelector('.hourly-forecast'),
    aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

function getWeatherDetails(name, lat, lon, country, state) {
    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
        AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Fetch Air Quality Index Data
    fetch(AIR_POLLUTION_API_URL)
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load Air Quality data'))
        .then(data => {
            let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
            let aqiIndex = data.list[0].main.aqi;
            aqiCard.innerHTML = `
            <div class="card-head">
                <p>Air Quality Index</p>
                <p class="air-index aqi-${aqiIndex}">${aqiList[aqiIndex - 1]}</p>
            </div>
            <div class="air-indices">
                <i class="fa-regular fa-wind fa-3x"></i>
                <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
                <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
                <div class="item"><p>SO2</p><h2>${so2}</h2></div>
                <div class="item"><p>CO</p><h2>${co}</h2></div>
                <div class="item"><p>NO</p><h2>${no}</h2></div>
                <div class="item"><p>NO2</p><h2>${no2}</h2></div>
                <div class="item"><p>NH3</p><h2>${nh3}</h2></div>
                <div class="item"><p>O3</p><h2>${o3}</h2></div>
            </div>`;
        })
        .catch(error => {
            console.error(error);
            alert('Failed to fetch Air Quality Index');
        });

    // Fetch Current Weather Data
    fetch(WEATHER_API_URL)
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load weather data'))
        .then(data => {
            let date = new Date();
            currentWeatherCard.innerHTML = `
                <div class="current-weather">
                    <div class="details">
                        <p>Now</p>
                        <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                        <p>${data.weather[0].description}</p>
                    </div>
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
                    </div>
                </div>
                <hr>
                <div class="card-footer">
                    <p><i class="fa-light fa-calendar"></i>${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</p>
                    <p><i class="fa-light fa-location-dot"></i>${name}, ${country}</p>
                </div>`;
            
            let { sunrise, sunset } = data.sys,
                { timezone, visibility } = data,
                { humidity, pressure, feels_like } = data.main,
                { speed } = data.wind,
                sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A'),
                sSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');

            sunriseCard.innerHTML = `
                <div class="card-head">
                    <p>Sunrise & Sunset</p>
                </div>
                <div class="sunrise-sunset">
                    <div class="item">
                        <div class="icon"><i class="fa-light fa-sunrise fa-4x"></i></div>
                        <div><p>Sunrise</p><h2>${sRiseTime}</h2></div>
                    </div>
                    <div class="item">
                        <div class="icon"><i class="fa-light fa-sunset fa-4x"></i></div>
                        <div><p>Sunset</p><h2>${sSetTime}</h2></div>
                    </div>
                </div>`;
            
            humidityVal.innerHTML = `${humidity}%`;
            pressureVal.innerHTML = `${pressure} hPa`;
            visibilityVal.innerHTML = `${visibility} m`;
            windSpeedVal.innerHTML = `${speed} m/s`;
            feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(2)}&deg;C`;
        })
        .catch(error => {
            console.error(error);
            alert('Failed to fetch current weather');
        });

    // Fetch Weather Forecast Data
    fetch(FORECAST_API_URL)
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load forecast data'))
        .then(data => {
            hourlyForecastContainer.innerHTML = '';
            for (let i = 0; i <= 7; i++) {
                let hrForecastDate = new Date(data.list[i].dt_txt);
                let hr = hrForecastDate.getHours();
                let a = hr < 12 ? 'AM' : 'PM';
                hr = hr % 12 || 12; // Converts 0:00 to 12:00 AM
                hourlyForecastContainer.innerHTML += `
                    <div class="card">
                        <p>${hr} ${a}</p>
                        <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="" srcset="">
                        <p>${(data.list[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
                    </div>`;
            }

            let uniqueForecastDays = [];
            let filteredForecast = data.list.filter(forecast => {
                let forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            fiveDaysForecastCard.innerHTML = '';
            for (let i = 1; i < filteredForecast.length; i++) {
                let date = new Date(filteredForecast[i].dt_txt);
                fiveDaysForecastCard.innerHTML += `
                    <div class="forecast-item">
                        <div class="icon-wrapper">
                            <img src="https://openweathermap.org/img/wn/${filteredForecast[i].weather[0].icon}.png" alt="">
                            <span>${(filteredForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                        </div>
                        <p>${date.getDate()} ${months[date.getMonth()]}</p>
                        <p>${days[date.getDay()]}</p>
                    </div>`;
            }
        })
        .catch(error => {
            console.error(error);
            alert('Failed to fetch weather forecast');
        });
}

function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    cityInput.value = '';
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL)
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load city coordinates'))
        .then(data => {
            if (data.length > 0) {
                let { name, lat, lon, country, state } = data[0];
                getWeatherDetails(name, lat, lon, country, state);
            } else {
                alert('City not found. Please try again.');
            }
        })
        .catch(error => {
            console.error(error);
            alert(`Failed to fetch coordinates of ${cityName}`);
        });
}

function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition(position => {
        let { latitude, longitude } = position.coords;
        const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;
        fetch(REVERSE_GEOCODING_URL)
            .then(res => res.ok ? res.json() : Promise.reject('Failed to load location data'))
            .then(data => {
                if (data.length > 0) {
                    let { name, country, state } = data[0];
                    getWeatherDetails(name, latitude, longitude, country, state);
                } else {
                    alert('Failed to get location information.');
                }
            })
            .catch(error => {
                console.error(error);
                alert('Failed to fetch user coordinates');
            });
    }, error => {
        if (error.code === error.PERMISSION_DENIED) {
            alert('Geolocation permission denied. Please enable location services and try again.');
        }
    });
}

searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserCoordinates);
cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates());
window.addEventListener('load', getUserCoordinates);
