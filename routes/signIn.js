var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');

var sequelizeCon = new sequelize('gsd', 'gsd_server', '<Password>', {
    'dialect': 'mysql',
    'host': "localhost",
    "port": "3306"
});

router.get('/', function (req, res, next) {
    sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', {type: sequelize.QueryTypes.SELECT})
        .then(function (checkResult) {
            if (checkResult.length > 0) {
                res.render('signIn', {backgroundImg: checkResult[0].backgroundImg});
            } else {
                res.render('signIn');
            }
        });
});

module.exports = router;