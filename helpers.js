/**
 * Helper function for user lookup in database
 * @param {String} email 
 * @param {Object} database 
 * @returns a user object corresponding to email, null otherwise
 */
function userLookup(email, database){

  for (let user in database){ 

    if (email === database[user].email){
      return database[user];
    }

  }

}

/**
 * Helper function for checking if a user has access to a given URL
 * @param {String} reqURL
 * @param {Array} userURLS 
 * @returns true if the user is authorized, false otherwise
 */
function checkURLAuth(reqURL, userURLS){

  // Check if req URL contained in collection
  for (let urlObj of userURLS){
   
    if (urlObj.longURL === reqURL){
      return true;
    }

  }

  return false;
}

/**
 * Helper function for obtaining all URLs associated with a
 * given user id
 * @param {String} id 
 * @param {Object} urlDatabase
 * @returns an array of URL objects
 */
function urlsForUser(id, urlDatabase){
  
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
 * Generates and returns a string of 6 random alphanumeric characters
 * @returns a string of 6 random alphanumeric characters
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

module.exports = { userLookup, checkURLAuth, urlsForUser, generateRandomString };