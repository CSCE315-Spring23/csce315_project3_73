const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv").config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');

// Create express app
const app = express();
const port = 3000;
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

app.use(express.static(__dirname + '/views'));

app.get("/", (req, res) => {
  const data = { name: "Mario" };
  res.render("index", data);
});

app.get("/order", (req, res) => {
  menuitems = [];
  pool.query("SELECT * FROM menu;").then((query_res) => {
    for (let i = 0; i < query_res.rowCount; i++) {
      menuitems.push(query_res.rows[i]);
    }
    const data = { menuitems: menuitems }; 
    res.render("order", data);
  });
});

app.get('/orderquery', (req, res) => { 
  const query = req.query.query;
  pool.query(query)
      .then(result => {
          
          res.send(result.rows); 
      })
      .catch(error => {
          res.status(500).send(error);
           
      });
});

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: "947810255577-aggap7cvgjsnk288h2opb13igc811d0s.apps.googleusercontent.com",
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // This function will be called after successful authentication
    // You can use the "profile" object to get information about the authenticated user
    done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // This function will be called after successful authentication
    // Redirect the user to the home page or some other page
    res.redirect('/');
  }
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
