currOrder = [];
currOrderId = null;

function handleClick(itemId) {
  // Get the input element by its ID
  var textArea = document.getElementsByTagName("textarea")[0];

  // Change the value of the text area element to display the item name
  textArea.value += itemId + "\n";
  lastClicked = itemId;
  currOrder.push(itemId);
}

function handleDelete() {
  var textArea = document.getElementsByTagName("textarea")[0];
  textArea.value = "";
  currOrder.pop();
  for (var i = 0; i < currOrder.length; i++) {
    textArea.value += currOrder[i] + "\n";
  }
}
async function handleOrder() {
  var textArea = document.getElementsByTagName("textarea")[0];

  if (textArea.value == "") {
    return;
  }
  textArea.value = "";
  let totalPrice = 0.0; // initialize the total price
  const promises = currOrder.map((item) => {
    const query = encodeURIComponent(
      `SELECT menuid, itemprice FROM menu WHERE itemname = '${item}'`
    );
    return fetch(`/orderquery?query=${query}`)
      .then((response) => response.json())
      .then((data) => {
        const { menuid, itemprice } = data[0];
        totalPrice += Number(itemprice); // add the price to the total
        return menuid; // return the menu ID
      });
  });

  const orderIDs = await Promise.all(promises);
  const orderIDString = orderIDs.join(", "); 
   

  //get largest order id:
  if(currOrderId == null){
    const query2 = encodeURIComponent(
        `SELECT MAX(orderid) as max_orderid FROM orders`
      );
      const response = await fetch(`/orderquery?query=${query2}`);
      const data = await response.json();
      const maxOrderID = data[0].max_orderid;
      currOrderId = maxOrderID + 1;
  }
    
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hour = String(currentDate.getHours()).padStart(2, "0");
  const minute = String(currentDate.getMinutes()).padStart(2, "0");
  const second = String(currentDate.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  const query3 = encodeURIComponent(
    "INSERT INTO orders VALUES (" +
      currOrderId +
      ", '" +
      formattedDate +
      "', " +
      1 +
      ", " +
      1 +
      ", '" +
      orderIDString +
      "', " +
      totalPrice +
      ")"
  ); 
  const response = await fetch(`/orderquery?query=${query3}`);

   
  currOrder.splice(0, currOrder.length);
  currOrderId++;
}
