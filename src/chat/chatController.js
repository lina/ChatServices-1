var Chat = require('./chatModel');
var _ = require('underscore');
var userChatsController = require('../userChats/userChatsController')
var UserChats = require('../userChats/userChatsModel');

module.exports = {
  // Adding new participant to an existing conversation
  addedParticipant: function(messageData) {
    Chat.conversation.findOne({ chatId: messageData.chatId })
    .then(function(conversation) {
      if(conversation) {
        conversation.participants.push(messageData.newParticipantId);
      }
    })
  },

  // Creating a new conversation and saving it to db.
  createConversation: function(messageData) {
    Chat.conversation.findOne({ chatId: messageData.chatId})
    .then(function(conversation) {
      if(messageData) {

        // if conversation doesn't exist, then create a new conversation and save the associated properties 
        if(!conversation) {
          userChatsController.socketAddNewPrivChat(messageData.chatId, messageData.participants);
          var newConversation = new Chat.conversation();
          newConversation.chatId = messageData.chatId;
          newConversation.firstSender = messageData.firstSender;
          newConversation.timestamp_created = messageData.timestamp_updated;
          newConversation.participants = messageData.participants;
          newConversation.group = messageData.group;
          newConversation.save(function(err) {
            if(err) {
              console.log('unable to create new conversation');
              console.log('err:', err);
            } else {
              console.log('saved new conversation')
            }
          })

        } else {
          console.log('conversation exists. do not create new conversation')
        }
        
      }
    })
  },

  // Saves a new message to a conversation (could be an existing or new conversation)
  writeMessageToDatabase: function(messageData) {
    Chat.conversation.findOne({ chatId: messageData.conversationId })
    .then(function(conversation) {
      console.log("we're writing message to database, yay!");
      console.log('messageData', messageData);
      var messageParticipants;

      // Creates an array of message participants to save into new message schema 
      if(messageData.messageParticipants) {
        messageParticipants = Object.keys(messageData.messageParticipants);
      } else {
        messageParticipants = [];
      }

      // Create a message Schema and save message to message Schema
      if(messageData) {
        var newMessage = new Chat.message();
        newMessage.senderID = messageData.senderId;
        newMessage.timestamp_created = messageData.messageTime;
        newMessage.text = messageData.message;
        newMessage.conversationID = messageData.conversationId;
        newMessage.messageParticipants = messageParticipants;
        newMessage.save(function(err) {
          if(err) {
            var response = {err: 'Unable to save message'};
            console.log(response.err);
            console.log('err:', err);
          } else {
            console.log('new message is saved in schema');
          }
        });
      } else {
        console.log('messageData is undefined');
      }

      // Save newly created message Schema to an existing conversation schema in database.
      if(conversation) {
        conversation.timestamp_updated = messageData.messageTime;
        newMessage.messageParticipants = messageParticipants;
        conversation.messages.push(newMessage);
        if(messageParticipants.length > 2) {conversation.group = true} else {
          conversation.group = false;
        }
        conversation.save(function(err) {
          if(err) {
            var response = {error: 'Unable to save chat'};
            console.log(response.error);
            console.log('err', err);
          } else {
            console.log('added new message in conversation');
          }
        });
      // Creates a new conversation schema and save newly created message Schema to the new convo Schema
      } else {
        var conversation = new Chat.conversation();
        conversation.chatId = messageData.conversationId;
        conversation.firstSender = messageData.senderId;
        conversation.timestamp_updated = messageData.messageTime;
        conversation.participants = messageParticipants;
        conversation.messages.push(newMessage);
        if(messageParticipants.length > 2) {conversation.group = true} else {
          conversation.group = false;
        }
        conversation.save(function(err) {
          if(err) {
            var response = {error: 'Unable to save chat'};
            console.log(response.error);
            console.log('err', err);
          } else {
            console.log('added new message in conversation');
          }
        });
      }
    })
  },

  // Retrieve conversations for given chatIDs (post request done when user first logs on and system needs to retrieve all of the current user's past conversation)
  getChatDetails: function(req, res, next) {
    var userChats = req.body.chatIDs;
    if(!userChats) {
      res.sendStatus(400);
      return;
    }

    // Create an array to store all conversations. 
    var allConversations = [];
    for (var i = 0 ; i < userChats.length; i++) {
      var currChatId = userChats[i];
      Chat.conversation.findOne({chatId: currChatId})
      .then(function(conversation) {
        if(conversation) {
          allConversations.push(conversation);
        }

        // If all conversations have been retrieved, then send it back to client.
        if(allConversations.length === userChats.length) {
          res.status(200).send(allConversations); 
        }
      }.bind(this)).catch(function(err) {
        res.status(500).send(err);
        next(err);
      })
    }
  }
};

// leave extra line at end
