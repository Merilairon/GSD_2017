var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var async = require('async');

var sequelizeCon = new sequelize('gsd', 'gsd_server', '<Password>', {
    'dialect': 'mysql',
    'host': "localhost",
    "port": "3306"
});

/* GET home page. */
router.get('/', function (req, res, next) {
    async.parallel([
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
                sequelizeCon.query('SELECT username, rank FROM user WHERE username = "' + sessionIDCheck(req.cookies.sessionID) + '";', {type: sequelize.QueryTypes.SELECT})
                    .then(function (checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult[0])
                        } else {
                            callback(null, "");
                        }

                    });
            }
        ],
        function (err, results) {
            console.log("test");
            var member = false;
            var admin = false;
            if (results[1].rank >= 0) {
                member = true;
            }
            if (results[1].rank > 0) {
                admin = true
            }
            if (results[0].length > 0) {
                if (member || admin) {
                    res.redirect('/');
                } else {
                    res.render('applyHere', {
                        active: "Apply Here",
                        backgroundImg: results[0],
                        username: "",
                        member: false,
                        admin: false
                    });
                }
            } else {
                if (member || admin) {
                    res.redirect('/');
                } else {
                    res.render('applyHere', {
                        active: "Apply Here",
                        backgroundImg: "",
                        username: "",
                        member: false,
                        admin: false
                    });
                }
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

var sessionIDCheck = function (sessionID) {
    async.parallel(
        function (callback) {
            sequelizeCon.query('SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(sessionID) + '";', {type: sequelize.QueryTypes.SELECT})
                .then(function (checkResult) {
                    callback(null, checkResult);
                });
        },
        function (err, results) {
            if (results[0] > 0) {
                return results[0].username;
            } else {
                return null;
            }
        });
}


module.exports = router;