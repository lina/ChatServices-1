var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('underscore');

// Schema for storing messages. Messages created from this schema is in turn saved to the containing conversation schema using the associated conversationID
var MessageSchema = new mongoose.Schema({
  conversationID: String,
  senderID: String,
  timestamp_created: String,
  text: String,
  messageParticipants: Array
});

// Schema for storing conversations. Messages stores an array of message Objects created using Message Schema
var ConversationSchema = new mongoose.Schema({
  chatId: String,
  firstSender: String,
  timestamp_created: {type:Date, default: Date.now},
  timestamp_updated: String,
  participants: Array,
  messages: [MessageSchema],  
  group: Boolean
});

var message = mongoose.model('Message', MessageSchema, 'messages');
var conversation = mongoose.model('Conversation', ConversationSchema, 'conversations');

// exports to chatController
module.exports={
  message: message,
  conversation: conversation
};
