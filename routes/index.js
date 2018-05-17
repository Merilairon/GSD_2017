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

router.get('/home', function(req, res, next) {
    res.redirect('/home/1');
});


router.get('/home/:page', function(req, res, next) {
    var page = req.params.page;
    var re = /^[0-9]+$/;
    if (re.test(req.params.page)) {
        page = req.params.page;
    }
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
                sequelizeCon.query('SELECT * FROM carousel;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }
                    })
            },
            function(callback) {
                sequelizeCon.query('SELECT * FROM articlesindex ORDER BY date DESC;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult)
                        } else {
                            callback(null, "");
                        }
                    })
            }
        ],
        function(err, results) {
            var member = false;
            var admin = false;
            var dates = [];
            var totalPages;
            if (results[1].rank >= 0) {
                member = true;
            }
            if (results[1].rank > 0) {
                admin = true;
            }
            for (var i = 0; i < results[3].length; i++) {
                var date = "" + results[3][i].date;
                dates.push(date.substring(0, 10).split('-').reverse().join('-') + " " + date.substring(11, 24));
            }

            totalPages = Math.round(results[3].length / 5);

            if (results[0].length > 0) {
                res.render('index', {
                    active: "Home",
                    backgroundImg: results[0],
                    username: results[1].username,
                    member: member,
                    admin: admin,
                    carousel: results[2],
                    articles: results[3].slice((page - 1) * 5, (5 * page)),
                    dates: dates.slice((page - 1) * 5, (5 * page)),
                    page: page,
                    totalPages: totalPages
                });
            } else {
                res.render('index', {
                    active: "Home",
                    username: results[1].username,
                    carousel: results[2],
                    articles: results[3].slice((page - 1) * 5, (5 * page)),
                    dates: dates.slice((page - 1) * 5, (5 * page)),
                    page: page,
                    totalPages: totalPages
                });
            }
        });
});

var sessionIDCheck = function(sessionID) {
    async.parallel(
        function(callback) {
            sequelizeCon.query('SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(sessionID) + '";', { type: sequelize.QueryTypes.SELECT })
                .then(function(checkResult) {
                    callback(null, checkResult);
                });
        },
        function(err, results) {
            if (checkResult > 0) {
                return checkResult[0].username;
            } else {
                return null;
            }
        });

}

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