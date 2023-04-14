const axios = require('axios');

const getWeather = async (location) => {
  const API_KEY = '744dd002e597c065d1804fa120d67300';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getWeather;