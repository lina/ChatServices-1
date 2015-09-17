var userChatsController = require('./userChatsController');

module.exports = function(router){
  
  // The other controller methods are invoked via socket signal.
  router.post('/getAllUserChats', userChatsController.getAllUserChats);

};
