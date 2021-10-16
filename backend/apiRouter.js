var express = require('express');
var usersCtrl = require('./routes/usersCtrl');
var messagesCtrl = require('./routes/messagesCtrl');
// var likesCtrl = require('./routes/likesCtrl');
// const auth = require('./middleware/auth');
const router = express.Router();

// Router
exports.router = (function() {
    var router = express.Router();
    // Users routes
    router.post('/users/register/', usersCtrl.register);
    router.post('/users/login/', usersCtrl.login);
    router.get('/users/me/', usersCtrl.getUserProfile);
    router.put('/users/me/', usersCtrl.updateUserProfile);

    // Messages routes
    router.post('/messages/new/', messagesCtrl.createMessage);
    router.get('/messages/', messagesCtrl.listMessages);

    // // Likes
    // router.post('/messages/:messageId/vote/like', likesCtrl.likePost);
    // router.post('/messages/:messageId/vote/dislike', likesCtrl.dislikePost);
    return router;

})();