var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');

var sequelizeCon = new sequelize('gsd', 'gsd_server', '<Password>', {
    'dialect': 'mysql',
    'host': "localhost",
    "port": "3306",
    "timezone": "+01:00"
});

/* GET home page. */
router.get('/', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/admin', { page: 'admin' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
});

router.get('/applications', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/applications', { page: 'applications' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
});

router.get('/homepage', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/homepage', { page: 'homepage' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
});

router.get('/forum', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/forum', { page: 'forum' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });

});

router.get('/users', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/users', { page: 'users' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
});

router.get('/aboutUs', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/aboutus', { page: 'aboutUs' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
});

router.get('/background', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            res.render('admin/background', {
                                page: 'background',
                                backgroundImg: checkResult[0].backgroundImg
                            });
                        });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
});

router.get('/homepage/articles', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/articles', { page: 'articles' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
});

router.get('/homepage/carousel', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/carousel', { page: 'carousel' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
});

router.get('/forum/category', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/category', { page: 'category' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
});

router.get('/forum/subcategory', function(req, res, next) {
    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                if (checkResult[0].rank === 2) {
                    res.render('admin/subcategory', { page: 'subcategory' });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
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