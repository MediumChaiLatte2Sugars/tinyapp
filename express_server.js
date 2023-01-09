const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    username: req.cookies.username,
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username,
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  newSiteID = generateRandomString();
  urlDatabase[newSiteID] = req.body.longURL;
  res.redirect(`/urls/${newSiteID}`); // Redirect to new URL page
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  delete urlDatabase[req.params.id];
  res.redirect("/urls"); // Redirect to new URL page
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect("/urls"); 
});

app.post("/login", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.cookie("username", req.body.username);
  res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.clearCookie("username");
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

  let result = ' ';
  const charactersLength = characters.length;
  
  for ( let i = 0; i < STRING_LENGTH; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}