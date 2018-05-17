var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var async = require('async');
var bcrypt = require('bcrypt-nodejs');

var sequelizeCon = new sequelize('gsd', 'gsd_server', '<Password>', {
    'dialect': 'mysql',
    'host': "localhost",
    "port": "3306"
});

router.get('/', function (req, res, next) {
    sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', {type: sequelize.QueryTypes.SELECT})
        .then(function (checkResult) {
            if (checkResult.length > 0) {
                res.render('forgotPass', {backgroundImg: checkResult[0].backgroundImg});
            } else {
                res.render('forgotPass');
            }
        });
});

router.get('/:token', function (req, res, next) {
    async.parallel([
            function (callback) {
                sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', {type: sequelize.QueryTypes.SELECT})
                    .then(function (checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult[0]);
                        } else {
                            callback(null, {backgroundImg: ""});
                        }
                    });
            },
            function (callback) {
                sequelizeCon.query('SELECT resetToken FROM user WHERE resetToken IS NOT NULL;', {type: sequelize.QueryTypes.SELECT})
                    .then(function (checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult);
                        } else {
                            callback(null, {resetToken: ""});
                        }
                    });
            }
        ],
        function (err, results) {
            var exists = false;
            for (var i = 0; i < results[1].length; i++) {
                if (bcrypt.compareSync(req.params.token, results[1][i].resetToken)) {
                    exists = true;
                }
            }
            if (exists) {
                res.render('forgotPass', {backgroundImg: results[0].backgroundImg, token: req.params.token});
            } else {
                res.render('forgotPass', {backgroundImg: results[0].backgroundImg});
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
}

module.exports = router;