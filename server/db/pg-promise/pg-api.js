'use strict';

var stuff = require('./pgp.js');
require("babel-core/register");
var pgp = require('pg-promise')({
    //Initialization
});
var promise = require('bluebird');

// Connection parameters
var connection = {
    host: 'localhost',
    port: 5432,
    database: 'suggestionboxtest',
    user: 'postgres',
    password: 'postgres'
};

// // Global object from connection details
var db = pgp(connection);

var express = require('express');
var app = express();

// Note that we implement only GET handlers here, because:
// 1. This demo is to be tested by typing URL-s manually in the browser;
// 2. The demo's focus is on a proper database layer, not a web server.

//////////////////////////////////////////////
// Users Web API
//////////////////////////////////////////////

/**
*** Fetch list of suggestions based in order of newest 
*** Tested
**/
GET('/suggestions', (req) =>
    db.task(function *(t){
        var suggestions = yield t.any("SELECT * FROM suggestions ORDER BY createdate DESC LIMIT 10");
        console.log("suggestions: ", suggestions);
        return suggestions;
    })
    .catch(function(error){
        console.log("Error in getUserSuggestions: ", error);
    })
);



GET('/suggestions/:name', (req) => 
    db.task(function *(t){
        var user = yield t.one("SELECT userID FROM users WHERE username=${username}", {username: req.params.name});
        var suggestions = yield t.any("SELECT * FROM suggestions WHERE userID=${userID} ORDER BY createdate DESC", {userID: user.userid});
        console.log("suggestions: ", suggestions);
        return suggestions;
    })
    .catch(function(error){
        console.log("Error in getUserSuggestions: ", error);
    })
);

/**
*** Fetch all suggestion's answers in order of newest
*** tested
**/
GET('/getUserAnswers/:username', (req) =>
    db.task(function *(t){
        var user = yield t.one("SELECT userID FROM users WHERE username=${username}", {username: req.paramsusername});
        var answers = yield t.any("SELECT * FROM answers WHERE userID=${userID} ORDER BY createdate DESC", {userID: user.userid});
        console.log("answers: ", answers);
        return answers;
    })
    .catch(function(error){
        console.log("Error in getUserSuggestions: ", error);
    })
);


/**
*** Fetch suggestion votes
*** tested
**/
GET('/getSuggestionVotes/:suggestionID', (req) => 
    db.task(function* (t){
        var numVotes = yield t.one("SELECT votes FROM suggestions WHERE suggestionID=${suggestionID}", 
            {suggestionID: req.params.suggestionID});
        console.log("getSuggestionVotes: ", numVotes);
        return numVotes;
    })
    .catch(function(error){
        console.log("Error in getSuggestionVotes: ", error);
    })
);


/**
*** Fetch suggestion answers
*** tested
**/
GET('/getSuggestionAnswers/:suggestionID', (req) =>
    db.task(function* (t){
        var answers = yield t.any("SELECT * FROM answers WHERE suggestionID=${suggestionID}",
            {suggestionID: req.params.suggestionID});
        console.log(answers);
        return answers;
    })
    .catch(function(error){
        console.log("Error in getSuggestionAnswers: ", error);
    })
);

/**
*** Fetch suggestion views
*** tested
**/
GET('/getSuggestionViews/:suggestionID', (req) =>
    db.task(function* (t){
        var numViews = yield t.one("SELECT views FROM suggestions WHERE suggestionID=${suggestionID}", 
            {suggestionID: req.params.suggestionID});
        console.log(numViews);
        return numViews;
    })
    .catch(function(error){
        console.log("Error in getSuggestionViews: ", error);
    })
);

/**
*** Fetch suggestion tags
*** tested
**/
GET('/getSuggestionTags/:suggestionID', (req) => 
    db.task(function *(t){
        var tagNames = yield t.any("SELECT t.name FROM tags t WHERE t.tagID IN (SELECT st.tagID FROM suggestion_tags st WHERE st.suggestionID=${suggestionID})",{
                suggestionID: req.params.suggestionID
            });
        console.log("tagNames: ", tagNames);
        return tagNames;
    })
    .catch(function(error){
        console.log("Error in getSuggestionTags: ", error);
    })
);


/**
*** Insert answer 
*** tested
**/
GET('/postAnswer/:suggestionID/:parentID/:userID/:summary', (req) =>    
    db.one("INSERT INTO answers (suggestionID, parentID, userID, summary) VALUES(${suggestionID}, ${parentID}, ${userID}, ${summary}) returning answerID",{
        suggestionID: req.params.suggestionID, 
        parentID: req.params.parentID,
        userID: req.params.userID,
        summary: req.params.summary
    })
    .then(function(answerId){
        // Success
        console.log("Answer was posted successfully!");
        return answerId
    })
    .catch(function(error){
        console.log("Error in postAnswer: ", error);
    })
);



/**
*** Insert suggestion 
*** Tested
**/
GET('/postSuggestion/:userID/:title/:summary', (req) =>     
    db.one("INSERT INTO suggestions (userID, title, summary) VALUES (${userID}, ${title}, ${summary}) returning suggestionID",{
        userID: req.params.userID,
        title: req.params.title,
        summary: req.params.summary
    })
    .then(function(suggestionId){
        // Success
        console.log("inserted suggestionID: ", suggestionId)
        console.log("Posted suggestion successfully!");
        return suggestionId
    })
    .catch(function(error){
        console.log("Error in postSuggestion: ", error);
    })
);


/**
*** Insert tag into tags table
*** tested
**/
GET('/postTag/:tagName', (req) => 
    db.none("INSERT INTO tags (name) VALUES (${tagName})", {
        tagName: req.params.tagName,
    })
    .then(function(){
        // Success
        console.log("Successfully inserted Tag!");
    })
    .catch(function(error){
        console.log("Error in postTag", postTag);
    })
);


/**
*** Tag a suggestion 
*** - Attaches a tag to a suggestion.  Tag needs to have already exist from the Tags table
*** 
*** tested
**/
GET('/tagSuggestion/:suggestionID/:tagID', (req) =>     
    db.task(function * (t){
        const isAlreadyTagged = yield db.any("SELECT * FROM suggestion_tags WHERE suggestionID=${suggestionID} AND tagID=${tagID}", {
            suggestionID: req.params.suggestionID,
            tagID: tagID
        }); 
        console.log("isAlreadyTagged: ", isAlreadyTagged);
        isAlreadyTagged.length > 0 ?
            console.log("This suggestion is already tagged with that tag.")
            : db.none("INSERT INTO suggestion_tags (suggestionID, tagID) VALUES (${suggestionID}, ${tagID})", {
            suggestionID: req.params.suggestionID,
            tagID: tagID
        })
        .then(function(){
            // Success
            console.log("Successfully tied tag to suggestion");
        })
        .catch(function(error){
            console.log("Error in tagSuggestion: ", error);
        });
    })
);


/**
*** Upvote a suggestion 
*** Description: function call to increment vote counter by 1 by suggestionID
*** suggestionID: INT - ID of the suggestion
*** Tested
**/
GET('/upvoteSuggestion/:suggestionID', (req) => 
    db.none("UPDATE suggestions SET votes = votes + 1 WHERE suggestionID=${suggestionID}", {
        suggestionID: req.params.suggestionID
    })
    .then(function(){
        console.log("Successfully upvoted");
    })
    .catch(function(error){
        console.log("Error in upvoteSuggestion", error);
    })
);


/**
*** LDAP check
*** checks if ldap user is already in the DB
*** if not, create the user
**/

/**
*** Edit a suggestion
*** tested
**/
GET('/editSuggestion/:suggestionID/:summary/:title/:editedby',  (req) =>
    db.none("UPDATE suggestions SET summary=${summary}, title=${title}, lasteditby=${editedby} WHERE suggestionID=${suggestionID}", {
        summary: req.params.summary,
        title: req.params.title,
        editedby: req.params.editedby,
        suggestionID: req.params.suggestionID
    })
    .then(() => {
        console.log("Successfully edited the suggestion");
    })
    .catch((error) => {
        console.log("Error editing the suggestion: ", error);
    })
);

/**
*** Edit an answer
*** tested
*** editedby: userID of user editing the answer
**/ 
GET('/editAnswer/:answerID/:summary/:title/:editedby', (req) => 
    db.none("UPDATE answers SET summary=${summary}, lasteditby=${editedby} WHERE answerID=${answerID}", {
        answerID: req.params.answerID,
        summary: req.params.summary,
        editedby: req.params.editedby
    })
    .then(() => {
        console.log("Successfully updated answer")
    })
    .catch((error) => {
        console.log("Error editing the answer: ", error);
    })
);



/**
*** Mark as duplicate 
*** tested
**/
GET('/markAsDuplicate/:currentSuggestionID/:newSuggestionID', (req) =>  
    db.none("UPDATE suggestions SET isDuplicateOf=${newSuggestionID} WHERE suggestionID=${currentSuggestionID}", {
        currentSuggestionID: req.params.currentSuggestionID,
        newSuggestionID: req.params.newSuggestionID
    })
    .then( ()=>{
        console.log("Successfully marked the suggestion as a duplicate");
    })
    .catch( (error) => {
        console.log("Error markin the suggestion as a duplicate: ", error);
    })
);

/////////////////////////////////////////////
// Express/server part;
/////////////////////////////////////////////

// Generic GET handler;
function GET(url, handler) {
    app.get(url, (req, res) => {
        handler(req)
            .then(data => {
                res.json({
                    success: true,
                    data
                });
            })
            .catch(error => {
                res.json({
                    success: false,
                    error: error.message || error
                });
            });
    });
}

var port = 3001;

app.listen(port, () => {
    console.log('\nReady for GET requests on http://localhost:' + port);
});
