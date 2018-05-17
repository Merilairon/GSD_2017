var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var async = require('async');

var sequelizeCon = new sequelize('gsd', 'gsd_server', '<Password>', {
    'dialect': 'mysql',
    'host': "localhost",
    "port": "3306",
    'timezone': '+1:00'
});

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
                sequelizeCon.query('SELECT displayname, characterName, joinDate, lastSeen, country, steam, gender, CONVERT_TZ(birthday,"+00:00","+02:00") AS "birthday", rank FROM user;', { type: sequelize.QueryTypes.SELECT })
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
            var joinDates = [];
            var birthdays = [];
            var lastSeens = [];
            if (results[1].rank >= 0) {
                member = true;
            }
            if (results[1].rank > 0) {
                admin = true;
            }
            for (var i = 0; i < results[2].length; i++) {
                var joinDate = "" + ('00' + results[2][i].joinDate.getDate()).substr(-2) + "-" + ('00' + (results[2][i].joinDate.getMonth() + 1)).substr(-2) + "-" + results[2][i].joinDate.getFullYear();
                joinDates.push(joinDate);
                var birthday = "" + ('00' + results[2][i].birthday.getDate()).substr(-2) + "-" + ('00' + (results[2][i].birthday.getMonth() + 1)).substr(-2) + "-" + results[2][i].birthday.getFullYear();
                birthdays.push(birthday);
                var lastSeen = "" + ('00' + results[2][i].lastSeen.getDate()).substr(-2) + "-" + ('00' + (results[2][i].lastSeen.getMonth() + 1)).substr(-2) + "-" + results[2][i].lastSeen.getFullYear() + " " + ('00' + (results[2][i].lastSeen.getHours())).substr(-2) + ":" + ('00' + (results[2][i].lastSeen.getMinutes())).substr(-2);
                lastSeens.push(lastSeen);
            }
            if (results[0].length > 0) {
                res.render('community', {
                    active: "Community",
                    backgroundImg: results[0],
                    username: results[1].username,
                    member: member,
                    admin: admin,
                    users: results[2],
                    joinDates: joinDates,
                    birthdays: birthdays,
                    lastSeens: lastSeens
                });
            } else {
                res.render('community', {
                    active: "Community",
                    username: results[1].username,
                    users: results[2],
                    joinDates: joinDates,
                    birthdays: birthdays,
                    lastSeens: lastSeens
                });
            }
        });
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