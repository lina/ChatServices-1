var express = require('express');
var app = express();
var mongoose = require('mongoose');
var cors = require('cors');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chatController = require('./chat/chatController');
var userChatsController = require('./userChats/userChatsController');


// Socket connection with MobileFacade
io.on('connection', function (socket) {

  // Listens for events from client for messages to store in database
  socket.on('save message to database', function(data) {
    chatController.writeMessageToDatabase(data);
  });

  // Listens for events from client to save a new conversation to the database
  socket.on('create new conversation in database', function(conversationData) {
    chatController.createConversation(conversationData);
  });

  // Listens for events to add participants to database that stores all the conversations
  socket.on('add participant to conversation', function(messageData) {
    chatController.addedParticipant(messageData);
  });

  // Listens for events to add chat to participant's chat storage
  socket.on('add public chat to participant storage', function(chatID, participatingUsers) {
    for (var i = 0 ; i < participatingUsers.length; i++) {
      userChatsController.addPublicChatforUser(chatID, participatingUsers[i]);
    }
  });
});

// connect with mongoDB
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/chatservices');

// Router variable declaration
var chatRouter = express.Router();
var userChatsRouter = express.Router();

// uses middleware and hook up routes
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/api/chat', chatRouter);
app.use('/api/userChats', userChatsRouter);

require('./chat/chatRoutes')(chatRouter);
require('./userChats/userChatsRoutes')(userChatsRouter);

// Listen to server
var server = http.listen(process.env.PORT || 3003, function (){
  console.log('ChatServices listening on', server.address().address, server.address().port);
});

module.exports = app;

// Leave empty line at the end
