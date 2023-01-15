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

describe('urlsForUser', function(){
  it('should return an array of URL objects belonging to the user', function(){
    const userURLS = urlsForUser("user2RandomID", testDatabase);
      expect(userURLS).to.be.an.instanceOf(Array).and.to.deep.equal([
        { 
          id: "b2xVn2",
          longURL: "http://google.ca" 
        },
        { 
          id: "9sm5xK",
          longURL: "http://www.example.com"
         }]);
  });

  it('should return an empty array if the user does not own any URLs', function(){
    const should = require('chai').should()
      , userURLS = urlsForUser("userRandomID", testDatabase);
      userURLS.should.be.instanceOf(Array).and.to.be.empty;
  });

  it('should return an empty array if the databse is empty', function(){
    const should = require('chai').should()
      , emptyDatabase = {}
      , userURLS = urlsForUser("userRandomID", emptyDatabase);
      userURLS.should.be.instanceOf(Array).and.to.be.empty;
  });

});

describe('checkURLAuth', function(){
  it('should return false if the user does not have access to a given URL', function(){
    const userURLS = [{ id: "x3Alo5", longURL: "http://example2.com"}];
    const result = checkURLAuth("http://example.com", userURLS);
      expect(result).to.be.false;
  });

  it('should return false if the user has no URLs', function(){
    const userURLS = [];
    const result = checkURLAuth("http://example2.com", userURLS);
      expect(result).to.be.false;
  });

  it('should return true if the user has access to a URL', function(){
    const userURLS = [{id: "9sm5xK", longURL: "http://www.example.com"}];
    const result = checkURLAuth("http://www.example.com", userURLS);
      expect(result).to.be.true;
  });
});