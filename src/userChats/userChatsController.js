var UserChats = require('./userChatsModel');
var _ = require('underscore');

module.exports = {

  // Adds a new private conversation chatID to all participating users
  socketAddNewPrivChat: function(chatID, participantIDs) {
    if(chatID && participantIDs) {    
      if(participantIDs.length === 2) {
        var chatId = chatID;

        // loops through all participant IDs and saves chatID to each user one by one in the database
        for (var i =0 ; i < participantIDs.length; i++) {
          var userId = participantIDs[i];
          UserChats.findOne({userId: userId}, function(err, model) {
            if(model) {
              for (var j = 0 ; j < participantIDs.length; j++) {
                  var partnerId = participantIDs[j];
                  var tempObject = {};
                  tempObject[partnerId] = chatId;
                  model.chatId_private.push(tempObject);
              } // for loop
              for (var i = 0 ; i < model.chatId_all.length; i++) {
                if(model.chatId_all[i] === chatId) {
                  return;
                }
              }
              model.chatId_all.push(chatId);
              model.save(function(err) {
                if(err) {
                  var response = {error: 'Unable to save chat'};
                } else {
                  console.log('added chat details to user entry in db');
                }
              })
              console.log('user does exist');
            } else {
              console.log("couldn't find userId")
            } // if (model)
          }) // userChats.findOne   
        } // for loop
      }
    }
  },

  // Get all the chats that a given user is participating in. Post request called upon user login.
  getAllUserChats: function(req, res, next) {
    var userId = req.body.userId;
    if(!userId) {
      res.sendStatus(400);
      return;
    }
    UserChats.findOne({ userId: userId })
      .then(function(user) {
        if(user){
          res.status(200).send(user);
          next(user);
        } else {
          var newUser = new UserChats();
          newUser.userId = userId;
          newUser.chatId_all = [];
          newUser.chatId_private = [];
          newUser.save().then(function(newUser) {
            res.status(201).send(newUser);
            next(newUser);
          });
        }
      }.bind(this)).catch(function(err) {
        res.status(500).send(err);
        next(err);
      });
  },

  addNewPrivChat: function(req, res, next) {
    if(!req.body) {
      return res.status(400).json({error:"Bad Request"});
    } else {
      var chatId = req.body.chatId;
      var partnerId = req.body.author;
      var userId = req.body.userId;
      UserChats.findOne({userId: userId}, function(err, model) {
        if(model) {
          model.chatId_private.push({partnerId: chatId})
          model.chatId_all.push(chatId);
          model.save(function(err) {
            if(err) {
              var response = {error: 'Unable to save chat'};
              res.status(500).json(response);
            } else {
              console.log('added chat details to user entry in db');
              res.status(201).send();
            }
          })
          console.log('user does exist');
          res.status(201).send();
        } else {
          console.log("couldn't find userId in usermodel")
        }
      })
    }
  },

  // Add a public chat to user's storage.
  addPublicChatforUser: function(userId, chatId) {
    if(!userId) {
      return 'no user id';
    } else {
      UserChats.findOne({userId: UserId}, function(err, model) {
        if(model) {
          model.chatId_all.push(chatId);
          model.save(function(err) {
            if (err) {
              console.log('unable to save chat');
              console.log('error:', err);
            } else {
              console.log('added public chat id to user entry in db');
            }
          })
          console.log('user exists and found');
        } else {
          console.log("couldn't find userId in usermodel")  
        }
      })
    }
  }

};

// leave extra line at end
