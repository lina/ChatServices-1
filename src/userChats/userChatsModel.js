var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('underscore');

// Schema defined to store chatIDs of all conversation that the user is a part of
var UserChatSchema = new mongoose.Schema({
  userId: String,
  chatId_all: Array,
  chatId_private: Array
})

module.exports = mongoose.model('UserChats', UserChatSchema);
