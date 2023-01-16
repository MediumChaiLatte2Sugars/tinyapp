const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { userLookup, checkURLAuth, urlsForUser, generateRandomString } = require("./helpers");
const { urlDatabase, users } = require("./databases");

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

  const userID = req.session.user_id;

  // Show login page if not logged in
  if (!userID) {
    return res.redirect("/login");
  }

  return res.redirect("/urls");

});

// GET /urls
app.get("/urls", (req, res) => {

  const userID = req.session.user_id;

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

  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID],
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

  const userID = req.session.user_id;
  const urlID = req.params.id;

  // Check if user logged in
  if (!userID) {
    return res.status(401).send("Invalid request! Please login to view this page!");
  }

  // Check if URL in database already
  if (!urlDatabase[urlID]) {
    return res.status(404).send("Requested URL Not Found!");
  }

  let requestedURL = urlDatabase[req.params.id].longURL;

  // Check if auth to view URL
  if (!checkURLAuth(requestedURL, urlsForUser(userID, urlDatabase))) {
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[urlID].longURL,
    user: users[userID],
    currentPage: "/urls/:id",
  };

  res.render("urls_show", templateVars);

});

// GET /u/:id
app.get("/u/:id", (req, res) => {

  const urlID = req.params.id;

  // Check if URL exists
  if (!urlDatabase[urlID]) {
    return res.status(404).send("No such short URL exists!");
  }

  const longURL = urlDatabase[urlID].longURL;

  res.redirect(longURL);

});

// GET /register
app.get("/register", (req, res) => {

  const userID = req.session.user_id;
  
  const templateVars = {
    user: users[userID],
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

  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID],
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

  const userID = req.session.user_id;
  const longURL = req.body.longURL;

  // Check if user currenlty logged in
  if (!users[userID]) {
    return res.status(401).send("Invalid request! Please login to view this page!");
  }

  newSiteID = generateRandomString();

  urlDatabase[newSiteID] = {
    longURL: longURL,
    userID: userID,
  };

  res.redirect(`/urls/${newSiteID}`); // Redirect to new URL page

});

// POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {

  const urlID = req.params.id;
  const userID = req.session.user_id;

  // Check if id exists
  if (!urlDatabase[urlID]) {
    return res.status(404).send("Error: No such link exists!");
  }

  // Check if user signed in
  if (!userID) {
    return res.status(403).send("Invalid Request! Please sign in to view this page!");
  }

  let requestedURL = urlDatabase[urlID].longURL;

  // Check if user is auth to modify URL
  if (!checkURLAuth(requestedURL, urlsForUser(userID, urlDatabase))) {
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!");
  }

  delete urlDatabase[urlID];
  res.redirect("/urls"); // Redirect to new URL page

});

// POST /urls/:id
app.post("/urls/:id", (req, res) => {

  const userID = req.session.user_id;
  const urlID = req.params.id;
  const editURL = req.body.editURL;

  // Check if id exists
  if (!urlDatabase[urlID]) {
    return res.status(404).send("Error: No such link exists!");
  }

  // Check if user signed in
  if (!userID) {
    return res.status(403).send("Invalid Request! Please sign in to view this page!");
  }

  let requestedURL = urlDatabase[urlID].longURL;

  // Check if user is auth to modify URL
  if (!checkURLAuth(requestedURL, urlsForUser(userID, urlDatabase))) {
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!");
  }

  urlDatabase[urlID] = {
    longURL: editURL,
    userID: userID,
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
