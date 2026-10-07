const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 3000;

const API_KEY = process.env.API_KEY;

// Serve HTML, CSS and JavaScript
app.use(express.static(__dirname));


// ======================================================
// CURRENT WEATHER
// ======================================================

app.get("/weather", async (req, res) => {

    try {

        const { city, lat, lon } = req.query;

        if (!API_KEY) {
            return res.status(500).json({
                error: "API key is missing. Check your .env file."
            });
        }

        let url;

        // Search by city
        if (city) {

            url = new URL(
                "https://api.openweathermap.org/data/2.5/weather"
            );

            url.searchParams.set("q", city);
            url.searchParams.set("appid", API_KEY);
            url.searchParams.set("units", "metric");
        }

        // Search by GPS location
        else if (lat && lon) {

            url = new URL(
                "https://api.openweathermap.org/data/2.5/weather"
            );

            url.searchParams.set("lat", lat);
            url.searchParams.set("lon", lon);
            url.searchParams.set("appid", API_KEY);
            url.searchParams.set("units", "metric");
        }

        else {

            return res.status(400).json({
                error: "Please provide a city or location."
            });

        }


        console.log("Getting current weather...");

        const response = await fetch(url);

        const data = await response.json();


        if (!response.ok) {

            console.log("OpenWeather current weather error:", data);

            return res.status(response.status).json({
                error: data.message || "Unable to get weather."
            });

        }


        console.log(
            `Current weather received for ${data.name}`
        );

        res.json(data);


    } catch (error) {

        console.error(
            "Current weather server error:",
            error
        );

        res.status(500).json({
            error: "Server error while getting weather."
        });

    }

});


// ======================================================
// 5-DAY FORECAST
// ======================================================

app.get("/forecast", async (req, res) => {

    try {

        const { city, lat, lon } = req.query;


        if (!API_KEY) {

            return res.status(500).json({
                error: "API key is missing. Check your .env file."
            });

        }


        let url;


        // ------------------------------------------------
        // Forecast by city
        // ------------------------------------------------

        if (city) {

            url = new URL(
                "https://api.openweathermap.org/data/2.5/forecast"
            );

            url.searchParams.set("q", city);
            url.searchParams.set("appid", API_KEY);
            url.searchParams.set("units", "metric");

        }


        // ------------------------------------------------
        // Forecast by GPS coordinates
        // ------------------------------------------------

        else if (lat && lon) {

            url = new URL(
                "https://api.openweathermap.org/data/2.5/forecast"
            );

            url.searchParams.set("lat", lat);
            url.searchParams.set("lon", lon);
            url.searchParams.set("appid", API_KEY);
            url.searchParams.set("units", "metric");

        }


        else {

            return res.status(400).json({
                error: "Please provide a city or location."
            });

        }


        console.log("Getting 5-day forecast...");


        const response = await fetch(url);

        const data = await response.json();


        // ------------------------------------------------
        // Check OpenWeather response
        // ------------------------------------------------

        if (!response.ok) {

            console.log(
                "OpenWeather forecast error:",
                data
            );

            return res.status(response.status).json({
                error:
                    data.message ||
                    "Unable to get forecast."
            });

        }


        // ------------------------------------------------
        // Create daily forecast
        // ------------------------------------------------

        const daily = {};


        data.list.forEach(item => {

            // Example:
            // 2026-10-07 12:00:00

            const date =
                item.dt_txt.split(" ")[0];


            const time =
                item.dt_txt.split(" ")[1];


            // Create object for this date
            if (!daily[date]) {

                daily[date] = [];

            }


            daily[date].push({
                item: item,
                time: time
            });

        });


        // ------------------------------------------------
        // Select best forecast for each day
        // Prefer 12:00 PM
        // ------------------------------------------------

        const forecast = [];


        const dates =
            Object.keys(daily).sort();


        dates.forEach(date => {

            const entries = daily[date];


            // Find forecast closest to 12:00
            let bestEntry =
                entries[0];


            let smallestDifference =
                Infinity;


            entries.forEach(entry => {

                const hour =
                    parseInt(
                        entry.time.split(":")[0]
                    );


                const difference =
                    Math.abs(hour - 12);


                if (
                    difference <
                    smallestDifference
                ) {

                    smallestDifference =
                        difference;

                    bestEntry =
                        entry;

                }

            });


            const item =
                bestEntry.item;


            forecast.push({

                date: date,

                temperature:
                    Math.round(item.main.temp),

                feelsLike:
                    Math.round(item.main.feels_like),

                min:
                    Math.round(item.main.temp_min),

                max:
                    Math.round(item.main.temp_max),

                humidity:
                    item.main.humidity,

                wind:
                    Number(
                        (item.wind.speed * 3.6)
                            .toFixed(1)
                    ),

                description:
                    item.weather[0].description,

                weather:
                    item.weather[0].main,

                icon:
                    item.weather[0].icon

            });

        });


        // ------------------------------------------------
        // Only return first 5 days
        // ------------------------------------------------

        const fiveDayForecast =
            forecast.slice(0, 5);


        console.log(
            `Forecast received for ${data.city.name}`
        );

        console.log(
            `Forecast days: ${fiveDayForecast.length}`
        );


        // ------------------------------------------------
        // Send clean data to browser
        // ------------------------------------------------

        res.json({

            city: data.city.name,

            country: data.city.country,

            forecast: fiveDayForecast

        });


    } catch (error) {

        console.error(
            "Forecast server error:",
            error
        );

        res.status(500).json({

            error:
                "Server error while getting forecast."

        });

    }

});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("       🌤️ WEATHER APP STARTED");
    console.log("======================================");
    console.log(`Open: http://localhost:${PORT}`);
    console.log("======================================");
    console.log("");

});