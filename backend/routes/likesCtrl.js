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
        const rep_1 = 0;
        const rep_2 = 0;
        const r1 = 0;
        const r2 = 0;
        const r3 = 0;
        const r4 = 0;
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
                        done(null, likeLive)
                    })
                    .catch(function(error) {
                        return res.status(502).json({ 'error': 'unable to load like' });
                    });
            },
            function(likeLive) {
                if (likeLive) {
                    models.Like.destroy({
                            where: {
                                messageId: messageId,
                                userId: userId
                            }
                        })
                        .then(function(newLike) {
                            // return res.status(200).json({ deleteLikeLive });
                            done(null, newLike)
                        })
                        .catch(function(error) {
                            return res.status(502).json({ 'error': 'unable to delete like' });

                        });
                } else {
                    if (!likeLive) {
                        const newLike = models.Like.create({
                                messageId: messageId,
                                userId: userId
                            })
                            .then(function(newLike) {
                                // return res.status(200).json({ newLike });
                                done(newLike);
                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'unable to create newLike' });

                            });
                    }
                }
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

        // Params
        var messageId = parseInt(req.params.messageId);

        if (messageId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
                function(done) {
                    models.Message.findOne({
                            where: { id: messageId }
                        })
                        .then(function(messageFound) {
                            done(null, messageFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify message' });
                        });
                },
                function(messageFound, done) {
                    if (messageFound) {
                        models.User.findOne({
                                where: { id: userId }
                            })
                            .then(function(userFound) {
                                done(null, messageFound, userFound);
                            })
                            .catch(function(err) {
                                return res.status(500).json({ 'error': 'unable to verify user' });
                            });
                    } else {
                        res.status(404).json({ 'error': 'post already liked' });
                    }
                },
                function(messageFound, userFound, done) {
                    if (userFound) {
                        models.Like.findOne({
                                where: {
                                    userId: userId,
                                    messageId: messageId
                                }
                            })
                            .then(function(userAlreadyLikedFound) {
                                done(null, messageFound, userFound, userAlreadyLikedFound);
                            })
                            .catch(function(err) {
                                return res.status(500).json({ 'error': 'unable to verify is user already liked' });
                            });
                    } else {
                        res.status(404).json({ 'error': 'user not exist' });
                    }
                },
                function(messageFound, userFound, userAlreadyLikedFound, done) {
                    messageFound.addUser(userFound, { isLike: DISLIKED })
                    if (!userAlreadyLikedFound) {
                        models.Like.create({
                                userId: userFound.id,
                                messageId: messageFound.id,
                                isLike: DISLIKED,
                            })
                            .then(function(alreadyLikeFound) {
                                done(null, messageFound, userFound);
                            })
                            .catch(function(err) {
                                return res.status(500).json({ 'error': 'unable to set user reaction' });
                            });
                    } else {
                        if (userAlreadyLikedFound.isLike === LIKED) {
                            userAlreadyLikedFound.update({
                                isLike: DISLIKED,
                            }).then(function() {
                                done(null, messageFound, userFound);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update user reaction' });
                            });
                        } else {
                            res.status(409).json({ 'error': 'message already disliked' });
                        }
                    }
                },
                function(messageFound, userFound, done) {
                    messageFound.update({
                        likes: messageFound.likes - 1,
                    }).then(function() {
                        done(messageFound);
                    }).catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update message like counter' });
                    });
                },
            ],
            function(messageFound) {
                if (messageFound) {
                    return res.status(201).json(messageFound);
                } else {
                    return res.status(500).json({ 'error': 'cannot update message' });
                }
            });
    }
}