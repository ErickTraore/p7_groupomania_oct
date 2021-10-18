// Imports
var models = require('../models');
var jwtUtils = require('../utils/jwt.utils');
var asyncLib = require('async');

// Constants
const DISLIKED = 0;
const LIKED = 1;

// Routes
module.exports = {
    likePost: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        console.log('Utilisateur', userId);
        console.log(headerAuth);

        // Params
        var messageId = parseInt(req.params.messageId);
        console.log('message.id', messageId);

        if (messageId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            // on charge le message concerné dans la variable messageFound..
            function(done) {
                models.User.findOne({
                        where: {
                            id: userId
                        }
                    })
                    .then(function(userLive) {
                        // return res.status(200).json({ userLive });
                        done(null, userLive);

                    })
                    .catch(function(error) {
                        return res.status(502).json({ 'error': 'unable to load user' });
                    });
            },

            function(userlive, done) {
                models.Message.findOne({
                        where: {
                            id: messageId
                        }
                    })
                    .then(function(messageLive) {
                        // return res.status(200).json({ userLive });
                        done(null, messageLive);

                    })
                    .catch(function(error) {
                        return res.status(502).json({ 'error': 'unable to load message' });
                    });
            },
            function(messageLive, done) {
                models.Like.findOne({
                        where: {
                            messageId: messageId,
                            userId: userId
                        }
                    })
                    .then(function(likeLive) {
                        // return res.status(200).json({ likeLive });
                        done(null, likeLive, messageLive)
                    })
                    .catch(function(error) {
                        return res.status(502).json({ 'error': 'unable to load like' });
                    });
            },
            function(likeLive, messageLive, done) {
                if (likeLive) {
                    messageLive.update({
                        likes: messageLive.likes - 1,
                    }).then(function() {
                        done(messageLive);
                    }).catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                    });
                    models.Like.destroy({
                            where: {
                                messageId: messageId,
                                userId: userId
                            }
                        })
                        .then(function(newLike) {
                            // return res.status(200).json({ deleteLikeLive });
                            done(newLike)
                        })
                        .catch(function(error) {
                            return res.status(502).json({ 'error': 'unable to delete like' });
                        });
                } else {
                    if (!likeLive) {
                        messageLive.update({
                            likes: messageLive.likes + 1,
                        }).then(function() {
                            done(messageLive);
                        }).catch(function(err) {
                            res.status(500).json({ 'error': 'cannot update message like counter(create)' });
                        });
                        const newLike = models.Like.create({
                                messageId: messageId,
                                userId: userId,
                                isLike: LIKED,
                            })
                            .then(function(newLike) {
                                // return res.status(200).json({ newLike });
                                done(newLike);
                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'unable to create newLike' });

                            });
                    }
                };
            },

        ], function(newLike) {
            if (newLike) {
                return res.status(201).json(newLike);
            } else {
                return res.status(500).json({ 'error': 'cannot create newLike' });
            }
        });

    },
    dislikePost: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        console.log('Utilisateur', userId);
        console.log(headerAuth);

        // Params
        var messageId = parseInt(req.params.messageId);
        console.log('message.id', messageId);

        if (messageId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            // on charge le message concerné dans la variable messageFound..
            function(done) {
                models.User.findOne({
                        where: {
                            id: userId
                        }
                    })
                    .then(function(userLive) {
                        // return res.status(200).json({ userLive });
                        done(null, userLive);

                    })
                    .catch(function(error) {
                        return res.status(502).json({ 'error': 'unable to load user' });
                    });
            },

            function(userlive, done) {
                models.Message.findOne({
                        where: {
                            id: messageId
                        }
                    })
                    .then(function(messageLive) {
                        // return res.status(200).json({ userLive });
                        done(null, messageLive);

                    })
                    .catch(function(error) {
                        return res.status(502).json({ 'error': 'unable to load message' });
                    });
            },
            function(messageLive, done) {
                models.Like.findOne({
                        where: {
                            messageId: messageId,
                            userId: userId
                        }
                    })
                    .then(function(likeLive) {
                        // return res.status(200).json({ likeLive });
                        done(null, likeLive, messageLive)
                    })
                    .catch(function(error) {
                        return res.status(502).json({ 'error': 'unable to load like' });
                    });
            },
            function(likeLive, messageLive, done) {
                if (likeLive) {
                    messageLive.update({
                        likes: messageLive.dislikes + 1,
                    }).then(function() {
                        done(messageLive);
                    }).catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                    });
                    models.Like.destroy({
                            where: {
                                messageId: messageId,
                                userId: userId
                            }
                        })
                        .then(function(newLike) {
                            // return res.status(200).json({ deleteLikeLive });
                            done(newLike)
                        })
                        .catch(function(error) {
                            return res.status(502).json({ 'error': 'unable to delete like' });
                        });
                } else {
                    if (!likeLive) {
                        messageLive.update({
                            likes: messageLive.dislikes - 1,
                        }).then(function() {
                            done(messageLive);
                        }).catch(function(err) {
                            res.status(500).json({ 'error': 'cannot update message like counter(create)' });
                        });
                        const newLike = models.Like.create({
                                messageId: messageId,
                                userId: userId,
                                isLike: DISLIKED,
                            })
                            .then(function(newLike) {
                                // return res.status(200).json({ newLike });
                                done(newLike);
                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'unable to create newLike' });

                            });
                    }
                };
            },

        ], function(newLike) {
            if (newLike) {
                return res.status(201).json(newLike);
            } else {
                return res.status(500).json({ 'error': 'cannot create newLike' });
            }
        });

    }
}