var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var async = require('async');

var sequelizeCon = new sequelize('gsd', 'gsd_server', '<Password>', {
    'dialect': 'mysql',
    'host': "localhost",
    "port": "3306"
});

router.get('/', function (req, res, next) {
    async.parallel([
            function (callback) {
                sequelizeCon.query('SELECT CONVERT(aboutUs USING utf8) AS aboutUs FROM aboutus WHERE id = 1;', {type: sequelize.QueryTypes.SELECT})
                    .then(function (checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult[0].aboutUs);
                        } else {
                            callback(null, "");
                        }
                    });
            },
            function (callback) {
                sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', {type: sequelize.QueryTypes.SELECT})
                    .then(function (checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult[0].backgroundImg);
                        } else {
                            callback(null, "");
                        }
                    });
            },
            function (callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT username, rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', {type: sequelize.QueryTypes.SELECT})
                        .then(function (checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0])
                            } else {
                                callback(null, "");
                            }

                        });
                } else {
                    callback(null, "");
                }
            }
        ],
        function (err, results) {
            var member = false;
            var admin = false;
            if (results[2].rank >= 0) {
                member = true;
            }
            if (results[2].rank > 0) {
                admin = true
            }
            if (results[0].length > 0 && results[1].length > 0) {
                res.render('aboutUs', {
                    active: "About Us",
                    pageContent: results[0],
                    backgroundImg: results[1],
                    username: results[2].username,
                    member: member,
                    admin: admin
                });
            } else if (results[0].length > 0) {
                res.render('aboutUs', {active: "About Us", pageContent: results[0], username: results[2].username});
            } else {
                res.render('aboutUs', {
                    active: "About Us",
                    pageContent: "Content cannot be loaded properly!",
                    backgroundImg: results[1],
                    username: results[2].username
                });
            }
        });
});

var mysqlEscape = function (stringToEscape) {
    return stringToEscape
        .replace(/<script>/gi, '<p>Nice Try, ')
        .replace(/<\/script>/gi, '</p>')
        .replace(/\\/gi, "\\\\")
        .replace(/\'/gi, "\\\'")
        .replace(/\"/gi, "\\\"")
        .replace(/\n/gi, "\\\n")
        .replace(/\r/gi, "\\\r")
        .replace(/\x00/gi, "\\\x00")
        .replace(/\x1a/gi, "\\\x1a")
        .replace(/%20/gi, " ");
};

module.exports = router;