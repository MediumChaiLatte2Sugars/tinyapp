const { assert } = require('chai');

const { userLookup } = require('../helpers.js');

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

describe('userLookup', function() {
  it('should return a user with valid email', function() {
    const should = require('chai').should()
      , user = userLookup("user@example.com", testUsers)
      , expectedUserID = "userRandomID";
    user.should.be.a('object').and.have.a.property('id').with.a.valueOf(expectedUserID);
  });

  it('should return undefined with an invalid email', function() {
    const expect = require('chai').expect
      , user = userLookup("doesNOTexist@example.com", testUsers);
    expect(user).to.be.undefined;
  });

});