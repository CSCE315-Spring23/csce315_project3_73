document.addEventListener('DOMContentLoaded', function() {
  const weatherDiv = document.getElementById('weather');

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=College Station&appid=744dd002e597c065d1804fa120d67300`)
    .then(response => response.json())
    .then(data => {
      const temperature = (data.main.temp - 273.15) * 1.8 + 32;
      const roundedTemp = temperature.toFixed(2);
      const description = data.weather[0].description;
      const city = data.name;
      const country = data.sys.country;

      weatherDiv.innerHTML = `The weather in ${city}, ${country} is ${roundedTemp}°F and ${description}.`;
    })
    .catch(error => {
      console.log(error);
    });
});


function runReport(){
  var dropdown = document.getElementById("report-dropdown");
  var selectedValue = dropdown.value;

  if(selectedValue == "option0" ){

  }else if(selectedValue == "option1"){
    generateXReport();
  }else if(selectValue == "option2"){
    generateZReport();
  }else if(selectValue == "option3"){
    generateRestockReport();
  }else if(selectValue == "option4"){
    generateExcessReport();
  }

}

function generateXReport(){
  let salesOrderList = "";
  let count = 0;
  let salesAmount = 0.0;
  let itemQuantities = new Map();

  let currentDate = new Date();
  let formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");

  let startDate = currentDate.toISOString().slice(0, 10);

  try {
    const query = encodeURIComponent(
      `SELECT orderlist, orderprice FROM orders WHERE ordertime >= '${startDate}' AND ordertime < '${formattedDate}'`
    );
    fetch(`/orderquery?query=${query}`)
      .then((response) => response.json())
      .then((data) => {
        for (let result of data) {
          salesOrderList = result.orderlist;
          salesAmount += parseFloat(result.orderprice);
          let items = salesOrderList.split(",");
          count++;
          for (let item of items) {
            let quantity = itemQuantities.get(item) || 0;
            itemQuantities.set(item, quantity + 1);
          }
        }

        // Generate x report
        let reportOutput = document.getElementById("output-report").querySelector("p");
        let curr = "X Report (Ran At Time: " + formattedDate + "): <br>"; 
        curr = curr + "-------------------------------------------------- <br>"; 
        curr = curr + "# of Orders Up to now: " + count + "<br>"; 
        curr = curr + "-------------------------------------------------- <br>";

        // Fetch menu items for each item in the report
        let promises = [];
        for (let [item, quantity] of itemQuantities) {
          const menuQuery = encodeURIComponent(`SELECT itemname FROM menu WHERE menuid = ${item}`);
          let promise = fetch(`/orderquery?query=${menuQuery}`)
            .then((response) => response.json())
            .then((data) => {
              if (data.length > 0) {
                const itemName = data[0].itemname; 
                curr = curr + itemName + ": " + quantity + "<br>";
                return itemName;
              }
            });
          promises.push(promise);
        }

        // Update the report output with the menu item names
        Promise.all(promises).then(() => { 
          let roundedNum = salesAmount.toFixed(2);
          reportOutput.innerHTML = curr.replace(/\n/g, "<br>") + "<br><br> Total Sales: " + roundedNum + "<br>";
        });
      });
  } catch (d) {
    console.error(d);
  }
}

function generateZReport(){
  
}

function generateRestockReport(){
  
}

function generateExcessReport(){
  
}