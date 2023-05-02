var inputDate;
document.addEventListener("DOMContentLoaded", function () {
  var dateInput = document.getElementById("date-input");
   

  dateInput.addEventListener("input", function (event) {
    inputDate = event.target.value;
  });

  const weatherDiv = document.getElementById("weather");

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=College Station&appid=744dd002e597c065d1804fa120d67300`
  )
    .then((response) => response.json())
    .then((data) => {
      const temperature = (data.main.temp - 273.15) * 1.8 + 32;
      const roundedTemp = temperature.toFixed(2);
      const description = data.weather[0].description;
      const city = data.name;
      const country = data.sys.country;

      weatherDiv.innerHTML = `The weather in ${city}, ${country} is ${roundedTemp}°F and ${description}.`;
    })
    .catch((error) => {
      console.log(error);
    });
});

function runReport() {
  var dropdown = document.getElementById("report-dropdown");
  var selectedValue = dropdown.value;

  if (selectedValue == "option0") {
  } else if (selectedValue == "option1") {
    generateXReport();
  } else if (selectedValue == "option2") {
    generateZReport();
  } else if (selectedValue == "option3") {
    generateRestockReport();
  } else if (selectedValue == "option4") {
    generateExcessReport();
  }
}

function generateXReport() {
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
        let reportOutput = document
          .getElementById("output-report")
          .querySelector("p");
        let curr = "X Report (Ran At Time: " + formattedDate + "): <br>";
        curr = curr + "-------------------------------------------------- <br>";
        curr = curr + "# of Orders Up to now: " + count + "<br>";
        curr = curr + "-------------------------------------------------- <br>";

        // Fetch menu items for each item in the report
        let promises = [];
        for (let [item, quantity] of itemQuantities) {
          const menuQuery = encodeURIComponent(
            `SELECT itemname FROM menu WHERE menuid = ${item}`
          );
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
          reportOutput.innerHTML =
            curr.replace(/\n/g, "<br>") +
            "<br><br> Total Sales: " +
            roundedNum +
            "<br>";
        });
      });
  } catch (d) {
    console.error(d);
  }
}

function generateZReport() {
  let salesOrderList = "";
  let count = 0;
  let salesAmount = 0.0;
  let itemQuantities = {};

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];

  const sqlStatement = `SELECT * from orders WHERE ordertime >= '${formattedDate}'`;

  const query = encodeURIComponent(sqlStatement);

  fetch(`/orderquery?query=${query}`)
    .then((response) => response.json())
    .then((data) => {
      const fetchPromises = [];

      for (const result of data) {
        salesOrderList = result.orderlist;
        salesAmount += parseFloat(result.orderprice);
        const items = salesOrderList.split(",");
        count++;
        for (const item of items) {
          const quantity = itemQuantities[item] || 0;
          itemQuantities[item] = quantity + 1;
        }
      }

      // Generate report
      let reportOutput = document
        .getElementById("output-report")
        .querySelector("p");
      let curr = "Z Report(" + formattedDate + ")\n";
      curr += "-------------------------------------------------- \n";
      curr += "# of Orders Today: " + count + "\n";
      curr += "-------------------------------------------------- \n";

      // Iterate over entries in hash map
      for (const [item, quantity] of Object.entries(itemQuantities)) {
        try {
          const query = encodeURIComponent(
            `SELECT itemname FROM menu WHERE menuid = ${item}`
          );
          const fetchPromise = fetch(`/orderquery?query=${query}`)
            .then((response) => response.json())
            .then((data) => {
              const itemName = data[0].itemname; // Access the correct property name in the response
              curr += itemName + ": " + quantity + "\n";
            })
            .catch((error) => {
              console.error(error);
            });

          fetchPromises.push(fetchPromise);
        } catch (d) {
          d.printStackTrace();
          console.error(d.constructor.name + ": " + d.message);
        }
      }

      Promise.all(fetchPromises)
        .then(() => {
          const df = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
          });
          const roundedNum = parseFloat(df.format(salesAmount));
          reportOutput.innerHTML =
            curr.replace(/\n/g, "<br>") +
            "<br><br> Total Sales: " +
            roundedNum +
            "<br>";
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
}

function generateRestockReport() {}

function generateExcessReport() {
  const sqlStatement = `SELECT orderlist FROM orders WHERE ordertime >= '${inputDate}'`;
  const query = encodeURIComponent(sqlStatement);

  fetch(`/orderquery?query=${query}`)
    .then((response) => response.json())
    .then((data) => {
      let excessOrderList = "";
      let orderList = [];
      let invListVec = [];
      let inventoryCurr = {};
      let inventoryBefore = {};

      for (const result of data) {
        excessOrderList = result.orderlist;
        const items = excessOrderList.split(",");
        orderList.push(...items);
      }

      fetch(
        `/orderquery?query=${encodeURIComponent(`SELECT * FROM inventory`)}`
      )
        .then((response) => response.json())
        .then((inventoryData) => {
          for (const inventoryResult of inventoryData) {
            const currInv = inventoryResult.invid;
            const numItems = inventoryResult.numitems;
            inventoryCurr[currInv] = numItems;
          }

          const invListPromises = orderList.map((menuItem) =>
            fetch(
              `/orderquery?query=${encodeURIComponent(
                `SELECT invlist FROM menu WHERE menuid = ${menuItem}`
              )}`
            ).then((response) => response.json())
          );

          Promise.all(invListPromises)
            .then((invListData) => {
              for (const result of invListData) {
                const currInv = result[0]?.invlist; // Add a check for undefined
                if (currInv) {
                  const items = currInv.split(",");
                  invListVec.push(...items);
                }
              }

              for (const key in inventoryCurr) {
                inventoryBefore[key] = inventoryCurr[key];
              }

              for (const x of invListVec) {
                const quantity = inventoryBefore[x] || 0;
                if (quantity !== 0) {
                  inventoryBefore[x] = quantity + 1;
                }
              }

              let reportOutput = document
                .getElementById("output-report")
                .querySelector("p");

              reportOutput.innerHTML = "";

              for (const key in inventoryCurr) {
                let currName = "";
                const valBefore = inventoryBefore[key];
                const valCurr = inventoryCurr[key];

                const diff = Math.abs(valBefore - valCurr) / valBefore;

                if (diff < 0.1) {
                  fetch(
                    `/orderquery?query=${encodeURIComponent(
                      `SELECT itemname FROM inventory WHERE invid = ${key}`
                    )}`
                  )
                    .then((response) => response.json())
                    .then((result) => {
                      currName = result[0].itemname;

                      const diffPercentage = (diff * 100).toFixed(2);

                      reportOutput.innerHTML += `${currName}: ${diffPercentage}%<br>`;
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                }
              }
            })
            .catch((error) => {
              console.error(error);
            });
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
}

