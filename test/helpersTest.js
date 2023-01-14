const { assert, expect } = require('chai');

const { userLookup, urlsForUser, checkURLAuth } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  "b2xVn2": { 
    longURL: "http://google.ca", 
    userID: "user2RandomID",
  },
  "9sm5xK": { 
    longURL: "http://www.example.com",
    userID: "user2RandomID",
  }
};

describe('userLookup', function() {
  it('should return a user with valid email', function() {
    const should = require('chai').should()
      , user = userLookup("user@example.com", testUsers)
      , expectedUserID = "userRandomID";
    user.should.be.a('object').and.have.a.property('id').with.a.valueOf(expectedUserID);
  });

  it('should return undefined with an invalid email', function() {
    const user = userLookup("doesNOTexist@example.com", testUsers);
    expect(user).to.be.undefined;
  });

});

// describe('urlsForUser', function(){
//   it('should return an array of URL objects belonging to the user', function(){
//     const should = require('chai').should()
//       , userURLS = urlsForUser("user2RandomID", testDatabase);
//       userURLS.should.be.instanceOf(Array).and.have.keys([
//         { 
//           id: "b2xVn2",
//           longURL: "http://google.ca" 
//         },
//         { 
//           id: "b2xVn2",
//           longURL: "http://google.ca"
//          }]);
//   });

// });