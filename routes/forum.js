var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var async = require('async');

var sequelizeCon = new sequelize('gsd', 'gsd_server', '<Password>', {
    'dialect': 'mysql',
    'host': "localhost",
    "port": "3306",
    "timezone": "+2:00"
});

/* GET home page. */
router.get('/', function(req, res, next) {
    async.parallel([
            function(callback) {
                sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult[0].backgroundImg);
                        } else {
                            callback(null, "");
                        }
                    });
            },
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT username, rank, lastSeen FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0])
                            } else {
                                callback(null, "");
                            }

                        });
                } else {
                    callback(null, "");
                }
            },
            function(callback) {
                sequelizeCon.query('SELECT * FROM category;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }

                    });
            },
            function(callback) {
                sequelizeCon.query('SELECT * FROM subcategory;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }
                    })
            },
            function(callback) {
                sequelizeCon.query('SELECT id, name, superSubCategory FROM discussion', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }
                    });
            },
            function(callback) {
                sequelizeCon.query('SELECT MAX(sentDate) as sentDate, superDiscussionID, creator FROM comment GROUP BY superDiscussionID;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }
                    });
            },
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT id, dateSeen FROM discussionuser WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult)
                            } else {
                                callback(null, "");
                            }
                        });
                } else {
                    callback(null, "");
                }
            }
        ],
        function(err, results) {

            var newComments = [];
            var numNotSeen = [];
            var member = false;
            var admin = false;
            var numNotSeenSubCat = [];

            for (var x = 0; x < results[5].length; x++) {
                newComments[results[5][x].superDiscussionID] = true;
                for (var i = 0; i < results[6].length; i++) {
                    if (results[6][i].id == results[5][x].superDiscussionID) {
                        if (new Date(results[6][i].dateSeen) > new Date(results[5][x].sentDate)) {
                            newComments[results[5][x].superDiscussionID] = false;
                        } else {
                            newComments[results[5][x].superDiscussionID] = true;
                        }
                    }
                }
            }
            for (var i = 0; i < results[3].length; i++) {
                results[3][i].unseen = 0;
            }
            for (var i = 0; i < results[3].length; i++) {
                for (var x = 0; x < results[4].length; x++) {
                    if (results[3][i].name == results[4][x].superSubCategory) {
                        if (newComments[results[4][x].id])
                            results[3][i].unseen += 1;
                    }
                }
            }
            if (results[1].rank >= 0) {
                member = true;
            }

            if (results[1].rank > 0) {
                admin = true
            }
            if (results[0].length > 0) {
                if (!member && !admin) {
                    res.redirect('/');
                } else {
                    res.render('forum/category', {
                        active: "Forum",
                        backgroundImg: results[0],
                        username: results[1].username,
                        member: member,
                        admin: admin,
                        categories: results[2],
                        subcategories: results[3]
                    });
                }
            } else {
                if (!member && !admin) {
                    res.redirect('/');
                } else {
                    res.render('forum/category', {
                        active: "Forum",
                        backgroundImg: "",
                        username: results[1].username,
                        member: member,
                        admin: admin,
                        categories: results[2],
                        subcategories: results[3]
                    });
                }
            }
        }
    );
});

router.get('/:category', function(req, res, next) {
    async.parallel([
            function(callback) {
                sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult[0].backgroundImg);
                        } else {
                            callback(null, "");
                        }
                    });
            },
            function(callback) {
                if (req.cookies.sessionID) {
                    sequelizeCon.query('SELECT username, rank, lastSeen FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0])
                            } else {
                                callback(null, "");
                            }

                        });
                } else {
                    callback(null, "")
                }
            },
            function(callback) {
                sequelizeCon.query('SELECT name, description FROM subcategory WHERE superCategory = "' + mysqlEscape(req.params.category) + '";', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }

                    });
            }
        ],
        function(err, results) {
            var breadcrumbs = [
                ["Forum", "/forum"],
                [req.params.category]
            ];
            var member = false;
            var admin = false;
            if (results[1].rank >= 0) {
                member = true;
            }
            if (results[1].rank > 0) {
                admin = true
            }
            if (results[0].length > 0) {
                if (!member && !admin) {
                    res.redirect('/');
                } else {
                    res.render('forum/subcategory', {
                        active: "Forum",
                        backgroundImg: results[0],
                        username: results[1].username,
                        member: member,
                        admin: admin,
                        category: mysqlEscape(req.params.category),
                        subcategories: results[2],
                        breadcrumbs: breadcrumbs
                    });
                }
            } else {
                if (!member && !admin) {
                    res.redirect('/');
                } else {
                    res.render('forum/subcategory', {
                        active: "Forum",
                        backgroundImg: "",
                        username: results[1].username,
                        member: member,
                        admin: admin,
                        category: mysqlEscape(req.params.category),
                        subcategories: results[2],
                        breadcrumbs: breadcrumbs
                    });
                }
            }
        });
});

router.get('/:category/:subcategory', function(req, res, next) {
    async.parallel([
            function(callback) {
                sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult[0].backgroundImg);
                        } else {
                            callback(null, "");
                        }
                    });
            },
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT username, rank, lastSeen FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0])
                            } else {
                                callback(null, "");
                            }

                        });
                } else {
                    callback(null, "");
                }
            },
            function(callback) {
                sequelizeCon.query('SELECT name, creator, id FROM discussion WHERE superSubCategory = "' + mysqlEscape(req.params.subcategory) + '";', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }

                    });
            },
            function(callback) {
                sequelizeCon.query('SELECT MAX(sentDate) as sentDate, superDiscussionID, creator FROM comment GROUP BY superDiscussionID;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }
                    });
            },
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT id, dateSeen FROM discussionuser WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult)
                            } else {
                                callback(null, "");
                            }
                        });
                } else {
                    callback(null, "")
                }
            }
        ],
        function(err, results) {

            var breadcrumbs = [
                ["Forum", "/forum"],
                [req.params.category, "/forum/" + req.params.category],
                [req.params.subcategory]
            ];
            var member = false;
            var admin = false;
            var newComments = [];
            for (var x = 0; x < results[3].length; x++) {
                newComments[results[3][x].superDiscussionID] = true;
                for (var i = 0; i < results[4].length; i++) {
                    if (results[4][i].id == results[3][x].superDiscussionID) {
                        if (new Date(results[4][i].dateSeen) > new Date(results[3][x].sentDate)) {
                            newComments[results[3][x].superDiscussionID] = false;
                        } else {
                            newComments[results[3][x].superDiscussionID] = true;
                        }
                    }
                }
            }
            if (results[1].rank >= 0) {
                member = true;
            }
            if (results[1].rank > 0) {
                admin = true
            }
            for (var i = 0; i < results[3].length; i++) {
                results[3][i].sentDate = "" + ('00' + results[3][i].sentDate.getDate()).substr(-2) + "-" + ('00' + (results[3][i].sentDate.getMonth() + 1)).substr(-2) + "-" + results[3][i].sentDate.getFullYear() + " " + results[3][i].sentDate.toTimeString().substr(0, 8);
            }
            if (results[0].length > 0) {
                if (!member && !admin) {
                    res.redirect('/');
                } else {
                    res.render('forum/discussion', {
                        active: "Forum",
                        backgroundImg: results[0],
                        username: results[1].username,
                        member: member,
                        admin: admin,
                        category: mysqlEscape(req.params.category),
                        subcategory: mysqlEscape(req.params.subcategory),
                        discussions: results[2],
                        dates: results[3],
                        newComments: newComments,
                        breadcrumbs: breadcrumbs
                    });
                }
            } else {
                if (!member && !admin) {
                    res.redirect('/');
                } else {
                    res.render('forum/discussion', {
                        active: "Forum",
                        backgroundImg: "",
                        username: results[1].username,
                        member: member,
                        admin: admin,
                        category: mysqlEscape(req.params.category),
                        subcategory: mysqlEscape(req.params.subcategory),
                        discussions: results[2],
                        dates: results[3],
                        newComments: newComments,
                        breadcrumbs: breadcrumbs
                    });
                }
            }
        });
});

router.get('/:category/:subcategory/:discussion', function(req, res, next) {
    async.parallel([
            function(callback) {
                sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult[0].backgroundImg);
                        } else {
                            callback(null, "");
                        }
                    });
            },
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT username, rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0])
                            } else {
                                callback(null, "");
                            }

                        });
                } else {
                    callback(null, "");
                }
            },
            function(callback) {
                sequelizeCon.query('SELECT sentDate, comment, creator, superDiscussionID, editDate FROM comment WHERE superDiscussionID = "' + mysqlEscape(req.params.discussion) + '";', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }

                    });
            },
            function(callback) {
                sequelizeCon.query('SELECT name FROM discussion WHERE id = "' + mysqlEscape(req.params.discussion) + '";', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }

                    });
            },
            function(callback) {
                sequelizeCon.query('SELECT username, displayname, joinDate, lastSeen, avatar FROM user;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }

                    });
            },
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT username, id, dateSeen FROM discussionuser WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult)
                            } else {
                                callback(null, "");
                            }
                        });
                } else {
                    callback(null, "");
                }
            }
        ],
        function(err, results) {
            if (results[3] != null && results[3].length > 0) {

                var usernames = [];
                var displaynames = [];
                var joinDates = [];
                var lastSeens = [];
                var avatars = [];
                var editDates = [];

                var member = false;
                var admin = false;
                var inUserDiscussion = false;
                var breadcrumbs = [
                    ["Forum", "/forum"],
                    [req.params.category, "/forum/" + req.params.category],
                    [req.params.subcategory, "/forum/" + req.params.category + "/" + req.params.subcategory],
                    [results[3][0].name]
                ];

                for (var i = 0; i < results[5].length; i++) {
                    if (results[5][i].id == mysqlEscape(req.params.discussion)) {
                        inUserDiscussion = true;
                        break;
                    }
                }
                if (inUserDiscussion) {
                    sequelizeCon.query('UPDATE discussionuser SET dateSeen = NOW() WHERE id = "' + mysqlEscape(req.params.discussion) + '" AND username = "' + results[5][0].username + '";', { type: sequelize.QueryTypes.UPDATE });
                } else {
                    sequelizeCon.query('INSERT INTO discussionuser(id, username, dateSeen) VALUES(' + mysqlEscape(req.params.discussion) + ', "' + results[1].username + '", NOW());', { type: sequelize.QueryTypes.INSERT });
                }

                if (results[1].rank >= 0) {
                    member = true;
                }
                if (results[1].rank > 0) {
                    admin = true
                }
                for (var i = 0; i < results[4].length; i++) {
                    usernames.push(results[4][i].username);
                    displaynames.push(results[4][i].displayname);
                    avatars.push(results[4][i].avatar);
                    joinDates.push("" + ('00' + results[4][i].joinDate.getDate()).substr(-2) + "-" + ('00' + (results[4][i].joinDate.getMonth() + 1)).substr(-2) + "-" + results[4][i].joinDate.getFullYear());
                    lastSeens.push("" + ('00' + results[4][i].lastSeen.getDate()).substr(-2) + "-" + ('00' + (results[4][i].lastSeen.getMonth() + 1)).substr(-2) + "-" + results[4][i].lastSeen.getFullYear());
                }
                if (results[2].length > 0) {
                    results[2].forEach(function(object) {
                        if (object.editDate == null) {
                            editDates.push(null);
                        } else {
                            var date = new Date(object.editDate);
                            console.log("" + object.toString());
                            editDates.push("" + ('00' + date.getDate()).substr(-2) + "-" + ('00' + (date.getMonth() + 1)).substr(-2) + "-" + date.getFullYear() + " " + date.toTimeString().substr(0, 8));
                        }
                    });
                }
                if (results[0].length > 0) {
                    if (!member && !admin) {
                        res.redirect('/');
                    } else {
                        res.render('forum/comment', {
                            active: "Forum",
                            backgroundImg: results[0],
                            username: results[1].username,
                            member: member,
                            admin: admin,
                            category: mysqlEscape(req.params.category),
                            subcategory: mysqlEscape(req.params.subcategory),
                            discussion: results[3][0].name,
                            comments: results[2],
                            usernames: usernames,
                            displaynames: displaynames,
                            lastSeens: lastSeens,
                            joinDates: joinDates,
                            editDates: editDates,
                            avatars: avatars,
                            id: mysqlEscape(req.params.discussion),
                            breadcrumbs: breadcrumbs
                        });
                    }
                } else {
                    if (!member && !admin) {
                        res.redirect('/');
                    } else {
                        res.render('forum/comment', {
                            active: "Forum",
                            backgroundImg: "",
                            username: results[1].username,
                            member: member,
                            admin: admin,
                            category: mysqlEscape(req.params.category),
                            subcategory: mysqlEscape(req.params.subcategory),
                            discussion: results[3][0].name,
                            comments: results[2],
                            usernames: usernames,
                            displaynames: displaynames,
                            lastSeens: lastSeens,
                            joinDates: joinDates,
                            editDates: editDates,
                            avatars: avatars,
                            id: mysqlEscape(req.params.discussion),
                            breadcrumbs: breadcrumbs
                        });
                    }
                }
            } else {
                res.render('error');
            }
        });
});

var mysqlEscape = function(stringToEscape) {
    return stringToEscape
        .replace(/\\/gi, "\\\\")
        .replace(/\'/gi, "\\\'")
        .replace(/\"/gi, "\\\"")
        .replace(/\n/gi, "\\\n")
        .replace(/\r/gi, "\\\r")
        .replace(/\x00/gi, "\\\x00")
        .replace(/\x1a/gi, "\\\x1a")
        .replace(/%20/gi, " ");
}

module.exports = router;