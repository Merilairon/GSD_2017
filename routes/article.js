var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var async = require('async');

var sequelizeCon = new sequelize('gsd', 'gsd_server', '<Password>', {
    'dialect': 'mysql',
    'host': "localhost",
    "port": "3306",
    "timezone": "+1:00"
});

router.get('/', function(req, res, next) {
    res.redirect('/home/1');
});

router.get('/:id', function(req, res, next) {
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
                sequelizeCon.query('SELECT * FROM articlesindex WHERE id=' + req.params.id + ';', { type: sequelize.QueryTypes.SELECT })
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
            var member = false;
            var admin = false;
            if (results[1].rank >= 0) {
                member = true;
            }
            if (results[1].rank > 0) {
                admin = true;
            }
            if (results[2].length >= 1) {
                var dateString = "" + results[2][0].date;
                var date = dateString.substring(0, 10).split('-').reverse().join('-') + " " + dateString.substring(11, 24);
                console.log(dateString);
                date = date.substring(0, 10).split('-').reverse().join('-') + " " + date.substring(11, 24);
                res.render('article', {
                    active: "Home",
                    member: member,
                    admin: admin,
                    date: date,
                    article: results[2][0],
                    backgroundImg: results[0]
                });
            } else {
                res.render('error');
            }
        }
    );
});


var mysqlEscape = function(stringToEscape) {
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