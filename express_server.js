const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { userLookup, checkURLAuth, urlsForUser, generateRandomString } = require("./helpers");

/**
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 * ■■■■ Express initial setup
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

/**
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 * ■■■■ Databases
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

const users = {};

/**
 * Database contents left intact for illustrative purposes
 * of the structure
 */
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: undefined,
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: undefined,
  }
};

/**
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 * ■■■■ Middlewares
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

app.use(cookieSession({

  name: 'session',
  keys: ['Secret345'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours

}));


app.use(express.urlencoded({ extended: true }));

/**
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 * ■■■■ GET
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

// GET /
app.get("/", (req, res) => {

  // Show login page if not logged in
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  return res.redirect("/urls");

});

// GET /urls
app.get("/urls", (req, res) => {

  let userID = req.session.user_id;

  // Check if user logged in
  if (!userID) {
    return res.status(401).send("Invalid request! Please login to view this page!");
  }

  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: users[userID],
    currentPage: "/urls",
  };

  res.render("urls_index", templateVars);

});

// GET /urls/new
app.get("/urls/new", (req, res) => {

  const templateVars = {
    user: users[req.session.user_id],
    currentPage: "/urls/new",
  };

  // Redirect if user not logged in
  if (!templateVars.user) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);

});

// GET /urls/:id
app.get("/urls/:id", (req, res) => {

  // Check if user logged in
  if (!req.session.user_id) {
    return res.status(401).send("Invalid request! Please login to view this page!");
  }

  // Check if URL in database already
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Requested URL Not Found!");
  }

  let requestedURL = urlDatabase[req.params.id].longURL;

  // Check if auth to view URL
  if (!checkURLAuth(requestedURL, urlsForUser(req.session.user_id, urlDatabase))) {
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
    currentPage: "/urls/:id",
  };

  res.render("urls_show", templateVars);

});

// GET /u/:id
app.get("/u/:id", (req, res) => {

  // Check if URL exists
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("No such short URL exists!");
  }

  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);

});

// GET /register
app.get("/register", (req, res) => {

  const templateVars = {
    user: users[req.session.user_id],
    currentPage: "/register",
  };

  // Redirect logged in users /urls page
  if (templateVars.user) {
    return res.redirect("/urls");
  }

  res.render("account_registration", templateVars);

});

// GET /login
app.get("/login", (req, res) => {

  const templateVars = {
    user: users[req.session.user_id],
    currentPage: "/login",
  };

  // Redirect logged in users /urls page
  if (templateVars.user) {
    return res.redirect("/urls");
  }

  res.render("account_login", templateVars);

});

/**
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 * ■■■■ POST
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

// POST /urls
app.post("/urls", (req, res) => {

  // Check if user currenlty logged in
  if (!users[req.session.user_id]) {
    return res.status(401).send("Invalid request! Please login to view this page!");
  }

  newSiteID = generateRandomString();

  urlDatabase[newSiteID] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };

  res.redirect(`/urls/${newSiteID}`); // Redirect to new URL page

});

// POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {

  // Check if id exists
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Error: No such link exists!");
  }

  // Check if user signed in
  if (!req.session.user_id) {
    return res.status(403).send("Invalid Request! Please sign in to view this page!");
  }

  let requestedURL = urlDatabase[req.params.id].longURL;

  // Check if user is auth to modify URL
  if (!checkURLAuth(requestedURL, urlsForUser(req.session.user_id, urlDatabase))) {
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls"); // Redirect to new URL page

});

// POST /urls/:id
app.post("/urls/:id", (req, res) => {

  // Check if id exists
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Error: No such link exists!");
  }

  // Check if user signed in
  if (!req.session.user_id) {
    return res.status(403).send("Invalid Request! Please sign in to view this page!");
  }

  let requestedURL = urlDatabase[req.params.id].longURL;

  // Check if user is auth to modify URL
  if (!checkURLAuth(requestedURL, urlsForUser(req.session.user_id, urlDatabase))) {
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!");
  }

  urlDatabase[req.params.id] = {
    longURL: req.body.editURL,
    userID: req.session.user_id,
  };

  res.redirect("/urls");

});

// POST /login
app.post("/login", (req, res) => {

  const { email, password } = req.body;

  let user = userLookup(email, users);

  // Check if current user exists in database
  if (!user) {
    return res.status(403).send("No account is registered with that email!");
  }

  // Check if password is correct
  if (!bcrypt.compareSync(password, userLookup(email, users).password)) {
    return res.status(403).send("Incorrect password!");
  }

  req.session.user_id = user.id;

  res.redirect("/urls");

});

// POST /logout
app.post("/logout", (req, res) => {

  req.session = null;

  res.redirect("/login");

});

// POST /register
app.post("/register", (req, res) => {
  
  const userID = `user-${generateRandomString()}`;

  // Check if email and password are defined
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Invalid Request!");
  }

  // Check if email already exists in database
  if (userLookup(req.body.email, users)) {
    return res.status(400).send("Invalid Request! User exists!");
  }

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };

  req.session.user_id = userID;

  res.redirect("/urls");

});

/**
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 * ■■■■ Listener
 * ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});
