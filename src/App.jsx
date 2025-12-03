import {
  convertTemperature,
  getHumidityValue,
  getVisibilityValue,
} from './components/Helper.jsx';
import {
  HumidityIcon,
  WindIcon,
  VisibilityIcon,
  SunriseIcon,
  SunsetIcon,
} from './components/icon.jsx';
import WeatherBackground from './components/WeatherBackground.jsx';
import React, { useState, useEffect } from 'react';

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState('C');
  const [error, setError] = useState('');
  const API_key = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
  
  useEffect(() => {
    if (city.trim().length > 3 && !weather) {
      const timer = setTimeout(() => fetchSuggestion(city), 500);
      return () => clearTimeout(timer);
    }
    setSuggestion([]);
  }, [city, weather]);

  const fetchSuggestion = async (query) => {
    try {
      const res = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_key}`
      );
      if (res.ok) {
        setSuggestion(await res.json());
      } else {
        setSuggestion([]);
      }
    } catch {
      setSuggestion([]);
    }
  };

  const fetchWeatherData = async (url, name = '') => {
    setError('');
    setWeather(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'City not found');
      }
      const data = await response.json();
      setWeather(data);
      setCity(name || data.name);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return setError('Please enter a valid city name');
    await fetchWeatherData(
      `http://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_key}&units=metric`
    );
  };

  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };

  return (
    <>
      <div className="min-h-screen">
        <WeatherBackground condition={getWeatherCondition()} />
        <div className="flex items-center justify-center p-6 min-h-screen">
          <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10">
            <h1 className="text-4xl font-extrabold text-center mb-6">Weather App</h1>

            <form onSubmit={handleSearch} className="flex flex-col relative">
            <div className="mb-4 border border-white/40 rounded-lg px-3 py-2 bg-black/20">
  <input
    value={city}
    onChange={(e) => setCity(e.target.value)}
    placeholder="Enter city name"
    aria-label="City name input"
    className="w-full bg-transparent text-white placeholder-white focus:outline-none"
  />
</div>

              {suggestion.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-black bg-opacity-30 rounded shadow-md z-10">
                  {suggestion.map((s) => (
                    <button
                      type="button"
                      key={`${s.lat}-${s.lon}`}
                      onClick={() =>
                        fetchWeatherData(
                          `http://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_key}&units=metric`,
                          `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ''}`
                        )
                      }
                      className="w-full text-left py-2 px-4 text-sm hover:bg-blue-700 bg-transparent transition-colors"
                    >
                      {s.name}, {s.country}
                      {s.state && `, ${s.state}`}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="submit"
                className="bg-purple-700 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Get Weather
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>

            {weather && (
              <>
                <div className="mt-6 text-center transition-opacity duration-500">
                  <button
                    onClick={() => {
                      setWeather(null);
                      setCity('');
                    }}
                    className="mb-4 bg-purple-700 text-white font-semibold py-1 px-3 rounded hover:bg-blue-700 transition-colors"
                  >
                    New Search
                  </button>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold">{weather.name}</h2>
                  <button
                    onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded transition-colors"
                  >
                    &deg;{unit}
                  </button>
                </div>

                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="mx-auto my-4 animate-bounce"
                />

                <p className="text-4xl mb-1">
                  {convertTemperature(weather.main.temp, unit)}&deg;{unit}
                </p>
                <p className="capitalize mb-4">{weather.weather[0].description}</p>

                <div className="flex flex-wrap justify-around mt-6">
                  {/* Humidity */}
                  <div className="flex items-center m-2 flex-col">
                    {HumidityIcon()}
                    <p className="mt-1">Humidity</p>
                    <p className="text-lg font-semibold">
                      {weather.main.humidity}% ({getHumidityValue(weather.main.humidity)})
                    </p>
                  </div>

                  {/* Wind */}
                  <div className="flex items-center m-2 flex-col">
                    {WindIcon()}
                    <p className="mt-1">Wind</p>
                    <p className="text-lg font-semibold">
                      {weather.wind.speed} m/s {weather.wind.deg ? `(${weather.wind.deg}°)` : ''}
                    </p>
                  </div>

                  {/* Visibility */}
                  <div className="flex items-center m-2 flex-col">
                    {VisibilityIcon()}
                    <p className="mt-1">Visibility</p>
                    <p className="text-lg font-semibold">
                      {getVisibilityValue(weather.visibility)}
                    </p>
                  </div>

                  {/* Sunrise */}
                  <div className="flex items-center m-2 flex-col">
                    {SunriseIcon()}
                    <p className="mt-1">Sunrise</p>
                    <p className="text-lg font-semibold">
                      {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Sunset */}
                  <div className="flex items-center m-2 flex-col">
                    {SunsetIcon()}
                    <p className="mt-1">Sunset</p>
                    <p className="text-lg font-semibold">
                      {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-sm space-y-2">
                  <p>
                    <strong>Feels Like:</strong>{' '}
                    {convertTemperature(weather.main.feels_like, unit)}&deg;{unit}
                  </p>
                  <p>
                    <strong>Pressure:</strong> {weather.main.pressure} hPa
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
