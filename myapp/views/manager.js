document.addEventListener('DOMContentLoaded', function() {
     
    const weatherDiv = document.getElementById('weather');
  
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=College Station&appid=744dd002e597c065d1804fa120d67300`)
      .then(response => response.json())
      .then(data => {
        const temperature = Math.round(data.main.temp - 273.15);
        const description = data.weather[0].description;
        const city = data.name;
        const country = data.sys.country;
  
        weatherDiv.innerHTML = `The weather in ${city}, ${country} is ${temperature * 1.8 + 31}°F and ${description}.`;
      })
      .catch(error => {
        console.log(error);
      });
  });
  