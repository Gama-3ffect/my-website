const apiKey = "9ab8b613b5fa0b98dde88d41889807bf"; // Replace with your OpenWeatherMap API key
let lastSearchedCity = "Lusaka"; // Default city
const randomCities = ["New York", "Tokyo", "Paris", "London", "Cairo", "Sydney", "Mumbai"]; // Fallback options

// Select elements
const searchInput = document.querySelector(".search-bar input");
const searchButton = document.querySelector("#search-btn");
const weatherDetails = document.querySelector(".weather-details");
const forecastContainer = document.querySelector(".forecast-container");
const loader = document.getElementById("loader");
const body = document.body; // For background updates

function showPopup(title, text, icon) {
    Swal.fire({
        title: title,
        text: text,
        icon: icon, // Options: 'success', 'error', 'warning', 'info', 'question'
        confirmButtonText: "OK",
    });
}

// Show loader
function showLoader() {
    loader.style.display = "block";
}

// Hide loader
function hideLoader() {
    loader.style.display = "none";
}

async function fetchWeather(city) {
    showLoader(); // Show loader before starting the fetch
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        const forecastResponse = await fetch(forecastUrl);

        if (!weatherResponse.ok || !forecastResponse.ok) throw new Error("City not found");

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
        updateBackground(weatherData.weather[0].main);
        lastSearchedCity = city;
        forecastContainer.style.display = "flexWrap"; // Show the forecast container
    } catch (error) {
        alert("Unable to fetch weather data. Please try again.");
        resetUI();
        forecast.style.display = "none"; // Hide the forecast container if city is not found
    } finally {
        hideLoader(); // Hide loader after fetch completes
    }
}


async function fetchWeatherByLocation() {
    // Show random city's weather first
    const randomCity = getRandomCity();
    await fetchWeather(randomCity); // Fetch weather for the random city
    document.addEventListener("DOMContentLoaded", async () => {
        fetchWeatherByLocation();
    });    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

                try {
                    const weatherResponse = await fetch(weatherUrl);
                    const forecastResponse = await fetch(forecastUrl);

                    if (!weatherResponse.ok || !forecastResponse.ok) {
                        showPopup("Error", "Unable to fetch weather data. Please try again.");
                    }                    

                    const weatherData = await weatherResponse.json();
                    const forecastData = await forecastResponse.json();

                    updateWeatherUI(weatherData);
                    updateForecastUI(forecastData);
                    updateBackground(weatherData.weather[0].main);
                } catch (error) {
                    alert("Unable to fetch location weather data. Showing random city's weather.");
                }
            },
            () => {
                alert("Location access denied. Showing random city's weather.");
            }
        );
    } else {
        alert("Geolocation not supported. Showing random city's weather.");
    }
}


// Reset UI to a default state
function resetUI() {
    weatherDetails.innerHTML = "<p>Please search for a city or allow location access.</p>";
    forecastContainer.innerHTML = "";
}

// Update weather UI
function updateWeatherUI(data) {
    const { name, main, weather, wind } = data;
    const weatherCondition = weather[0].main;

    const weatherIcons = {
        Clear: "icons/clear.png",
        Rain: "icons/rain.png",
        Clouds: "icons/clouds.png",
        Snow: "icons/snow.png",
        Thunderstorm: "icons/thunderstorm.png",
        Drizzle: "icons/drizzle.png",
        Mist: "icons/mist.png",
        Haze: "icons/haze.png",
        default: "icons/default.png",
    };

    const iconPath = weatherIcons[weatherCondition] || weatherIcons.default;

    weatherDetails.innerHTML = `
        <h2>${name}</h2>
        <img src="${iconPath}" alt="${weather[0].description}">
        <div>${Math.round(main.temp)}°C</div>
        <h4>${weather[0].description}</h4>
        <div class="col">
            <div class="humidity">
                <img src="icons/humidity.png" alt="Humidity Icon">
                <h3>Humidity: ${main.humidity}%</h3>
            </div>
            <div class="speed">
                <img src="icons/wind.png" alt="Wind Icon">
                <h3>Wind Speed: ${Math.round(wind.speed)} km/h</h3>
            </div>
        </div>
    `;
}

// Update forecast UI
function updateForecastUI(data) {
    forecastContainer.innerHTML = "";

    const dailyForecast = data.list.filter((item, index) => index % 8 === 0);
    dailyForecast.forEach((forecast) => {
        const { dt_txt, main, weather } = forecast;
        const weatherCondition = weather[0].main;

        const weatherIcons = {
            Clear: "icons/clear.png",
            Rain: "icons/rain.png",
            Clouds: "icons/clouds.png",
            Snow: "icons/snow.png",
            Thunderstorm: "icons/thunderstorm.png",
            Drizzle: "icons/drizzle.png",
            Mist: "icons/mist.png",
            Haze: "icons/haze.png",
            default: "icons/default.png",
        };

        const iconPath = weatherIcons[weatherCondition] || weatherIcons.default;

        const forecastItem = document.createElement("div");
        forecastItem.classList.add("forecast-item");
        forecastItem.innerHTML = `
            <h3>${new Date(dt_txt).toLocaleDateString()}</h3>
            <img src="${iconPath}" alt="${weather[0].description}">
            <div class="temp">${Math.round(main.temp)}°C</div>
            <h4>${weather[0].description}</h4>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

// Update background based on weather condition
function updateBackground(condition) {
    const weatherBackgrounds = {
        Clear: "url('images/clearsky.jpg')",
        Rain: "url('images/rain.jpg')",
        Clouds: "url('images/cloudy.jpg')",
        Snow: "url('images/snow.jpg')",
        Thunderstorm: "url('images/thunderstorm.jpg')",
        Drizzle: "url('images/drizzle.jpg')",
        Mist: "url('images/mist.jpg')",
        Haze: "url('images/haze.jpg')",
        default: "url('images/default.jpg')",
    };

    body.style.backgroundImage = weatherBackgrounds[condition] || weatherBackgrounds.default;
    body.style.backgroundSize = "cover";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";
}

// Event listener for the search button
searchButton.addEventListener("click", async () => {
    const city = searchInput.value.trim();
    if (city) {
        showLoader(); // Show loader only when a search is initiated
        await fetchWeather(city); // Fetch the weather data
        hideLoader(); // Hide loader after the fetch completes
        searchInput.value = ""; // Clear the input
    } else {
        alert("Please enter a city name.");
    }
});


// Utility function to get a random city
function getRandomCity() {
    return randomCities[Math.floor(Math.random() * randomCities.length)];
}

// Initial Load: Fetch location or fallback to a random city
document.addEventListener("DOMContentLoaded", () => {
    fetchWeatherByLocation();
});

const popup = document.getElementById("custom-popup");
const popupClose = document.getElementById("popup-close");
const popupOk = document.getElementById("popup-ok");

function showPopup(title, text) {
    document.getElementById("popup-title").innerText = title;
    document.getElementById("popup-text").innerText = text;
    popup.classList.remove("hidden");
}

popupClose.addEventListener("click", () => popup.classList.add("hidden"));
popupOk.addEventListener("click", () => popup.classList.add("hidden"));
