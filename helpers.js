/**
 * Helper function for user lookup in database
 * @param {*} email 
 * @param {*} database 
 * @returns a user object corresponding to email, null otherwise
 */
function userLookup(email, database){
  for (let user in database){ 
    if (email === database[user].email){
      return database[user];
    }
  }
}

module.exports = { userLookup };