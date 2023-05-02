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
          salesAmount += result.orderprice;
          let items = salesOrderList.split(",");
          count++;
          for (let item of items) {
            let quantity = itemQuantities.get(item) || 0;
            itemQuantities.set(item, quantity + 1);
          }
        }

        // Generate x report
        let reportOutput = document.getElementById("output-report").querySelector("p");
        reportOutput.textContent = "X Report (Ran At Time: " + formattedDate + "): \n";
        let curr = reportOutput.textContent;
        reportOutput.textContent = curr + "-------------------------------------------------- \n";
        curr = reportOutput.textContent;
        reportOutput.textContent = curr + "# of Orders Up to now: " + count + "\n";
        curr = reportOutput.textContent;
        reportOutput.textContent = curr + "-------------------------------------------------- \n";

        // Iterate over the hashmap
        let promises = [];
        for (let [item, quantity] of itemQuantities) {
          const query = encodeURIComponent(`SELECT menuid, itemprice FROM menu WHERE itemname = '${item}'`);
          let promise = fetch(`/orderquery?query=${query}`)
            .then((response) => response.json())
            .then((data) => {
              if (data.length > 0) {
                const { menuid, itemprice } = data[0];
                let curr = reportOutput.textContent;
                reportOutput.textContent = curr + item + ": " + quantity + "\n";
                let totalPrice = salesAmount + parseFloat(itemprice);
                salesAmount = totalPrice;
                return menuid;
              }
            });
          promises.push(promise);
        }

        Promise.all(promises).then(() => {
          curr = reportOutput.textContent;
          let roundedNum = salesAmount.toFixed(2);
          reportOutput.textContent = curr + "\n" + "\n Total Sales: " + roundedNum + "\n";
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