const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

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


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.userID],
  }

  // Check if user logged in
  if (!templateVars.user){
    return res.status(401).send("Invalid request! Please login to view this page!");
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userID],
  }

  // Redirect if user not logged in
  if (!templateVars.user){
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  // Check if user logged in
  if (!req.cookies.userID){
    return res.status(401).send("Invalid request! Please login to view this page!");
  }

  // Check if URL in database already
  if (!urlDatabase[req.params.id]){
    return res.status(404).send("Requested URL Not Found!");
  }

  let requestedURL = urlDatabase[req.params.id].longURL;

  // Check if auth to view URL
  if (!urlsForUser(req.cookies.userID).includes(requestedURL)){
    return res.status(403).send("Unauthorized! The requested URL does not belong to the current user!")
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.userID],
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
    user: users[req.cookies.userID],
  }

  // Redirect logged in users /urls page
  if (templateVars.user){
    return res.redirect("/urls");
  }
  res.render("account_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userID],
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
  if (!users[req.cookies.userID]){
    return res.status(401).send("Invalid request! Please login to view this page!");
  }
  
  newSiteID = generateRandomString();
  urlDatabase[newSiteID] = { 
    longURL: req.body.longURL,
    userID: req.cookies.userID,
   };

  res.redirect(`/urls/${newSiteID}`); // Redirect to new URL page
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  delete urlDatabase[req.params.id];
  res.redirect("/urls"); // Redirect to new URL page
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[req.params.id] = {
    longURL: req.body.editURL,
    userID: req.cookies.userID,
  }
  res.redirect("/urls"); 
});

app.post("/login", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const { email, password } = req.body;
  
  let user = userLookup(email);

  // Check if current user exists in database
  if (!user){
    return res.status(403).send("No account is registered with that email!");
  }

  // Check if password is correct
  if (user.password !== password){
    return res.status(403).send("Incorrect password!")
  }

  res.cookie("userID", user.id);
  res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.clearCookie("userID");
  res.redirect("/login"); 
});

app.post("/register", (req, res) => {
  const userID = `user-${generateRandomString()}`;

  // Check if email and password are defined
  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send("Invalid Request!");
  }

  // Check if email already exists in database
  if (userLookup(req.body.email)){
    res.status(400).send("Invalid Request! User exists!");
  }

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password,
  }
  res.cookie("userID", userID);
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
 * Helper fucntion for user lookup in database
 * @param {*} email 
 * @returns a user object corresponding to email, null otherwise
 * 
 */
function userLookup(email){
  for (let user in users){ 
    if (email === users[user].email){
      return users[user];
    }
  }
}

/**
 * Helper function for obtaining all URLs associated with a
 * given user id
 * @param {*} id 
 * @returns an array of URL strings
 */
function urlsForUser(id){
  let userURLs = [];
  for (let urlObj of Object.values(urlDatabase)){
    if (urlObj.userID === id){
      userURLs.push(urlObj.longURL);
    }
  }
  return userURLs;
}