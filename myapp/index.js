const express = require("express");

const getWeather = require('./weather');

const { Pool } = require("pg");
const dotenv = require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

// Create express app
const app = express();
const port = 3000;

var firstName = null;
var lastName = null;
var isAdmin = false;
var isServer = false;
var isCustomer = false;

// Create pool
const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT,
  ssl: { rejectUnauthorized: false },
});

process.on("SIGINT", function () {
  pool.end();
  console.log("Application successfully shutdown");
  process.exit(0);
});

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/views"));

app.use(
  session({
    secret: "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",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "947810255577-aggap7cvgjsnk288h2opb13igc811d0s.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "https://csce315-project3-73.onrender.com/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // This function will be called after successful authentication
      // You can use the "profile" object to get information about the authenticated user
      firstName = profile.name.givenName.toLowerCase();
      lastName = profile.name.familyName.toLowerCase();
      pool.query(`SELECT * FROM employees WHERE LOWER(firstname)='${firstName}' AND LOWER(lastname)='${lastName}'`)
        .then((result) => {
          if (result.rowCount > 0 && result.rows[0].isadmin) {
            isAdmin = true; 
          }else if(result.rowCount > 0 &&  result.rows[0].isadmin == false){ 
            isServer = true;
          }else{
            isCustomer = true;
          } 
          done(null, profile);
        })
        .catch((error) => {
          console.error(error);
          done(error);
        });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // This function will be called after successful authentication
    // Redirect the user to the home page or some other page
    if (isAdmin) {
      res.redirect("/manager");
    } else if(isCustomer){
      res.redirect("/customer");
    } else if(isServer){
      res.redirect("/order");
    }
     
  }
);
///////////////////////
///////////////////////

const ensureAuthenticated = async(req, res, next) => { 
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/google");
};

 

////////////////////////

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/order", ensureAuthenticated, (req, res) => {
  if (isAdmin || isServer) {
    menuitems = [];
    pool.query("SELECT * FROM menu;").then((query_res) => {
      for (let i = 0; i < query_res.rowCount; i++) {
        menuitems.push(query_res.rows[i]);
      }
      const data = { menuitems: menuitems };
      res.render("order", data);
    });
  }
});
app.get("/manager", ensureAuthenticated, (req, res) => {
  if (isAdmin) {
    res.render("manager");
  }
});

app.get("/orderquery", (req, res) => {
  const query = req.query.query;
  pool
    .query(query)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// add the following middleware after defining passport middleware
// app.use((req, res, next) => {
//   if (req.user) {
//     res.locals.user = req.user;
//   }
//   next();
// });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
