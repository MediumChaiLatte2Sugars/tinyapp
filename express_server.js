const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080
const { userLookup } = require("./helpers");

app.set("view engine", "ejs");

const users = {};

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

app.use(cookieSession({
  name: 'session',
  keys: ['Secret345'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  
  // Check if user logged in
  if (!userID){
    return res.status(401).send("Invalid request! Please login to view this page!");
  }

  const templateVars = {
    urls: urlsForUser(userID),
    user: users[userID],
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  }

  // Redirect if user not logged in
  if (!templateVars.user){
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  // Check if user logged in
  if (!req.session.user_id){
    return res.status(401).send("Invalid request! Please login to view this page!");
  }

  // Check if URL in database already
  if (!urlDatabase[req.params.id]){
    return res.status(404).send("Requested URL Not Found!");
  }

  let requestedURL = urlDatabase[req.params.id].longURL;

  // Check if auth to view URL
  if (!checkURLAuth(req.session.user_id, requestedURL)){
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!")
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  // TODO: Add check for current user
  const templateVars = {
    user: users[req.session.user_id],
  }

  // Redirect logged in users /urls page
  if (templateVars.user){
    return res.redirect("/urls");
  }
  res.render("account_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  }

  // Redirect logged in users /urls page
  if (templateVars.user){
    return res.redirect("/urls");
  }

  res.render("account_login", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  // Check if user currenlty logged in
  if (!users[req.session.user_id]){
    return res.status(401).send("Invalid request! Please login to view this page!");
  }
  
  newSiteID = generateRandomString();
  urlDatabase[newSiteID] = { 
    longURL: req.body.longURL,
    userID: req.session.user_id,
   };

  res.redirect(`/urls/${newSiteID}`); // Redirect to new URL page
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  // Check if id exists
  if (!urlDatabase[req.params.id]){
    res.status(404).send("Error: No such link exists!");
  }

  // Check if user signed in
  if (!req.session.user_id){
    res.status(403).send("Invalid Request! Please sign in to view this page!");
  }

  let requestedURL = urlDatabase[req.params.id].longURL;

  // Check if user is auth to modify URL
  if (!checkURLAuth(req.session.user_id, requestedURL)){
    console.log("Result of auth check:", checkURLAuth(req.params.id, requestedURL));
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!")
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls"); // Redirect to new URL page


});

app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  // Check if id exists
  if (!urlDatabase[req.params.id]){
    res.status(404).send("Error: No such link exists!");
  }

  // Check if user signed in
  if (!req.session.user_id){
    res.status(403).send("Invalid Request! Please sign in to view this page!");
  }

  let requestedURL = urlDatabase[req.params.id].longURL;

  // Check if user is auth to modify URL
  if (!checkURLAuth(req.session.user_id, requestedURL)){
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!");
  }

  urlDatabase[req.params.id] = {
    longURL: req.body.editURL,
    userID: req.session.user_id,
  }
  res.redirect("/urls"); 
});

app.post("/login", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const { email, password } = req.body;
  
  let user = userLookup(email, users);

  // Check if current user exists in database
  if (!user){
    return res.status(403).send("No account is registered with that email!");
  }

  // Check if password is correct
  if (!bcrypt.compareSync(password, userLookup(email, users).password)){
    return res.status(403).send("Incorrect password!");
  }

  req.session.user_id = user.id;
  res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  req.session = null;
  res.redirect("/login"); 
});

app.post("/register", (req, res) => {
  const userID = `user-${generateRandomString()}`;

  // Check if email and password are defined
  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send("Invalid Request!");
  }

  // Check if email already exists in database
  if (userLookup(req.body.email, users)){
    res.status(400).send("Invalid Request! User exists!");
  }

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  }
  req.session.user_id = userID;
  console.log("Current user database:", users);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/**
 * Generates and returns a string of 6 random alphanumeric characters
 */
function generateRandomString() {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const STRING_LENGTH = 6;

  let result = '';
  const charactersLength = characters.length;
  
  for ( let i = 0; i < STRING_LENGTH; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

/**
 * Helper function for obtaining all URLs associated with a
 * given user id
 * @param {*} id 
 * @returns an array of URL objects
 */
function urlsForUser(id){
  let userURL = [];
  
  for (let urlObj in urlDatabase){
    
    let urlToAdd;
    
    if (urlDatabase[urlObj].userID === id){
      urlToAdd = {
        id: urlObj,
        longURL: urlDatabase[urlObj].longURL,
      }
      userURL.push(urlToAdd);
    }
  }
  return userURL;
}

/**
 * Helper function for checking if a user (by id) has access to a given URL
 * @param {*} id 
 * @param {*} reqURL 
 * @returns true if the user is authorized, false otherwise
 */
function checkURLAuth(id, reqURL){

  userURL = urlsForUser(id);

  // Check if req URL contained in collection
  for (let urlObj of userURL){
   
    if (urlObj.longURL === reqURL){
      return true;
    }
  }
  return false;
}