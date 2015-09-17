var chatController = require('./chatController');

module.exports = function(router){

  // The other controller methods are invoked via socket signal.
  router.post('/getChatDetails', chatController.getChatDetails);

};
