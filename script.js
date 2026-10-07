// ======================================================
// GET CURRENT WEATHER
// ======================================================

async function getWeather() {

    const cityInput =
        document.getElementById("cityInput");

    const error =
        document.getElementById("error");

    const city =
        cityInput.value.trim();


    // Check city name
    if (city === "") {

        error.textContent =
            "❌ Please enter a city name.";

        return;

    }


    try {

        error.textContent =
            "⏳ Loading weather...";


        // ------------------------------------------------
        // Get current weather
        // ------------------------------------------------

        const response =
            await fetch(
                `/weather?city=${encodeURIComponent(city)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to get weather."
            );

        }


        // Display current weather
        displayWeather(data);


        // ------------------------------------------------
        // Get forecast
        // ------------------------------------------------

        await getForecast(city);


        error.textContent = "";


    } catch (error) {

        console.error(
            "Weather error:",
            error
        );


        document.getElementById("error")
            .textContent =
            "❌ " + error.message;

    }

}


// ======================================================
// DISPLAY CURRENT WEATHER
// ======================================================

function displayWeather(data) {


    // City
    document.getElementById("city")
        .textContent =
        `${data.name}, ${data.sys.country}`;


    // Temperature
    document.getElementById("temperature")
        .textContent =
        Math.round(data.main.temp);


    // Description
    document.getElementById("description")
        .textContent =
        data.weather[0].description;


    // Humidity
    document.getElementById("humidity")
        .textContent =
        `${data.main.humidity}%`;


    // Wind
    document.getElementById("wind")
        .textContent =
        `${(data.wind.speed * 3.6).toFixed(1)} km/h`;


    // Feels like
    document.getElementById("feelsLike")
        .textContent =
        `${Math.round(data.main.feels_like)}°C`;


    // Clouds
    document.getElementById("clouds")
        .textContent =
        `${data.clouds.all}%`;


    // Visibility
    document.getElementById("visibility")
        .textContent =
        `${(data.visibility / 1000).toFixed(1)} km`;


    // Minimum / Maximum
    document.getElementById("minMax")
        .textContent =
        `${Math.round(data.main.temp_min)}° / ${Math.round(data.main.temp_max)}°`;


    // Sunrise
    document.getElementById("sunrise")
        .textContent =
        formatTime(
            data.sys.sunrise,
            data.timezone
        );


    // Sunset
    document.getElementById("sunset")
        .textContent =
        formatTime(
            data.sys.sunset,
            data.timezone
        );


    // Weather icon
    const weather =
        data.weather[0].main;


    document.getElementById("weatherIcon")
        .textContent =
        getWeatherEmoji(weather);

}


// ======================================================
// WEATHER EMOJI
// ======================================================

function getWeatherEmoji(weather) {

    if (weather === "Clear") {

        return "☀️";

    }


    if (weather === "Clouds") {

        return "☁️";

    }


    if (weather === "Rain") {

        return "🌧️";

    }


    if (weather === "Drizzle") {

        return "🌦️";

    }


    if (weather === "Thunderstorm") {

        return "⛈️";

    }


    if (weather === "Snow") {

        return "❄️";

    }


    if (
        weather === "Mist" ||
        weather === "Fog" ||
        weather === "Haze"
    ) {

        return "🌫️";

    }


    return "🌤️";

}


// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(
    timestamp,
    timezoneOffset
) {

    const date =
        new Date(
            (timestamp + timezoneOffset) * 1000
        );


    return date
        .toUTCString()
        .slice(17, 22);

}


// ======================================================
// GET WEATHER USING MY LOCATION
// ======================================================

function getLocationWeather() {

    const error =
        document.getElementById("error");


    if (!navigator.geolocation) {

        error.textContent =
            "❌ Geolocation is not supported.";

        return;

    }


    error.textContent =
        "📍 Getting your location...";


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            try {

                // ----------------------------------------
                // Current weather
                // ----------------------------------------

                const weatherResponse =
                    await fetch(
                        `/weather?lat=${latitude}&lon=${longitude}`
                    );


                const weatherData =
                    await weatherResponse.json();


                if (!weatherResponse.ok) {

                    throw new Error(
                        weatherData.error ||
                        "Unable to get weather."
                    );

                }


                displayWeather(weatherData);


                // ----------------------------------------
                // Forecast
                // ----------------------------------------

                await getForecastByLocation(
                    latitude,
                    longitude
                );


                error.textContent = "";


            } catch (err) {

                console.error(err);

                error.textContent =
                    "❌ " + err.message;

            }

        },


        function(locationError) {

            if (
                locationError.code ===
                locationError.PERMISSION_DENIED
            ) {

                error.textContent =
                    "❌ Location permission was denied.";

            }

            else if (
                locationError.code ===
                locationError.POSITION_UNAVAILABLE
            ) {

                error.textContent =
                    "❌ Location information is unavailable.";

            }

            else {

                error.textContent =
                    "❌ Unable to get your location.";

            }

        }

    );

}


// ======================================================
// GET FORECAST BY CITY
// ======================================================

async function getForecast(city) {

    const container =
        document.getElementById(
            "forecastContainer"
        );


    try {

        // Show loading
        container.innerHTML = `
            <div class="forecast-loading">
                ⏳ Loading 5-day forecast...
            </div>
        `;


        const response =
            await fetch(
                `/forecast?city=${encodeURIComponent(city)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to get forecast."
            );

        }


        console.log(
            "Forecast data:",
            data
        );


        displayForecast(data);


    } catch (error) {

        console.error(
            "Forecast error:",
            error
        );


        container.innerHTML = `
            <div class="forecast-loading">
                ❌ Unable to load 5-day forecast
                <br>
                <small>${error.message}</small>
            </div>
        `;

    }

}


// ======================================================
// GET FORECAST BY LOCATION
// ======================================================

async function getForecastByLocation(
    latitude,
    longitude
) {

    const container =
        document.getElementById(
            "forecastContainer"
        );


    try {

        container.innerHTML = `
            <div class="forecast-loading">
                ⏳ Loading 5-day forecast...
            </div>
        `;


        const response =
            await fetch(
                `/forecast?lat=${latitude}&lon=${longitude}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to get forecast."
            );

        }


        console.log(
            "Location forecast:",
            data
        );


        displayForecast(data);


    } catch (error) {

        console.error(
            "Location forecast error:",
            error
        );


        container.innerHTML = `
            <div class="forecast-loading">
                ❌ Unable to load 5-day forecast
                <br>
                <small>${error.message}</small>
            </div>
        `;

    }

}


// ======================================================
// DISPLAY FORECAST
// ======================================================

function displayForecast(data) {

    const container =
        document.getElementById(
            "forecastContainer"
        );


    // Clear old forecast
    container.innerHTML = "";


    // Check forecast data
    if (
        !data ||
        !data.forecast ||
        data.forecast.length === 0
    ) {

        container.innerHTML = `
            <div class="forecast-loading">
                ❌ No forecast data available.
            </div>
        `;

        return;

    }


    // ------------------------------------------------
    // Create forecast cards
    // ------------------------------------------------

    data.forecast.forEach(dayData => {


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        // Format date
        const date =
            new Date(
                `${dayData.date}T12:00:00`
            );


        const day =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        // Weather icon
        const icon =
            getWeatherEmoji(
                dayData.weather
            );


        // Card HTML
        card.innerHTML = `

            <div class="day">
                ${day}
            </div>

            <div class="forecast-icon">
                ${icon}
            </div>

            <div class="forecast-temp">
                ${dayData.temperature}°C
            </div>

            <div class="forecast-description">
                ${dayData.description}
            </div>

            <div class="forecast-range">
                ${dayData.min}° / ${dayData.max}°
            </div>

        `;


        container.appendChild(card);

    });

}


// ======================================================
// ENTER KEY SEARCH
// ======================================================

document
    .getElementById("cityInput")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                getWeather();

            }

        }
    );