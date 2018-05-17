var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sequelize = require('sequelize');
var async = require('async');
var bcrypt = require('bcrypt-nodejs');
var cors = require('cors');
var multer = require('multer');
var nodemailer = require('nodemailer');
var chance = require('chance');

var index = require('./routes/index');
var forum = require('./routes/forum');
var aboutUs = require('./routes/aboutUs');
var applyHere = require('./routes/applyHere');
var calendar = require('./routes/calendar');
var community = require('./routes/community');
var signIn = require('./routes/signIn');
var settings = require('./routes/settings');
var admin = require('./routes/admin');
var forgotPass = require('./routes/forgotPass');
var article = require('./routes/article');

var app = express();

app.use(cors());

//DB connection
var sequelizeCon = new sequelize('gsd', 'gsd_server', '<Password>', {
    'dialect': 'mysql',
    'host': "localhost",
    "port": "3306",
    'timezone': '+2:00'
});

sequelizeCon.authenticate();

var transporter = nodemailer.createTransport({
    service: 'gmail',
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: 'gsdguild@gmail.com',
        pass: '<Password>'
    }
});

var numbGenerator = new chance();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, '../bower_components')));
app.use(function requireHTTPS(req, res, next) {
    if (!req.secure) {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

app.use('/', index);
app.use('/forum', forum);
app.use('/aboutUs', aboutUs);
app.use('/applyHere', applyHere);
app.use('/calendar', calendar);
app.use('/community', community);
app.use('/signIn', signIn);
app.use('/settings', settings);
app.use('/admin', admin);
app.use('/forgotPass', forgotPass);
app.use('/article', article);


var storageMulter = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./public/images");
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({ storage: storageMulter }).single("imgUpload");

app.post('/sentApplication', function(req, res) {
    var application = JSON.parse(req.body.application);

    async.parallel([
        function(callback) {
            sequelizeCon.query('SELECT * FROM application WHERE username = "' + mysqlEscape(application.username) + '";', { type: sequelize.QueryTypes.SELECT })
                .then(function(applicationControleResult) {
                    var usernameUniek = false;
                    if (applicationControleResult.length === 0) {
                        usernameUniek = true;
                    }
                    callback(null, usernameUniek);
                });
        },
        function(callback) {
            sequelizeCon.query('SELECT * FROM application WHERE gw2name = "' + mysqlEscape(application.gw2name) + '";', { type: sequelize.QueryTypes.SELECT })
                .then(function(applicationControleResult) {
                    var gw2nameUniek = false;
                    if (applicationControleResult.length === 0) {
                        gw2nameUniek = true;
                    }
                    callback(null, gw2nameUniek);
                });
        },
        function(callback) {
            sequelizeCon.query('SELECT email FROM user WHERE rank = 2;', { type: sequelize.QueryTypes.SELECT })
                .then(function(checkResult) {
                    if (checkResult.length > 0) {
                        callback(null, checkResult);
                    } else {
                        callback(null, "");
                    }
                });
        }
    ], function(err, results) {
        if (results[0] && results[1]) {
            sequelizeCon.query('INSERT INTO application (firstName, gender, country, birthday, info,username, email, password, gw2name, gw2version, why, ts, forums, whatsapp, playstyle, days, times, questions, sentDate, acceptance) VALUES ("' + mysqlEscape(application.firstName) + '", "' + mysqlEscape(application.gender) + '", "' + mysqlEscape(application.country) + '",  (STR_TO_DATE("' + application.birthday + '", "%d/%m/%Y")) , "' + mysqlEscape(application.info) + '", "' + mysqlEscape(application.username) + '", "' + mysqlEscape(application.email) + '", "' + bcrypt.hashSync(application.password) + '", "' + mysqlEscape(application.gw2name) + '", "' + mysqlEscape(application.gw2version) + '", "' + mysqlEscape(application.why) + '", "' + mysqlEscape(application.ts) + '", "' + mysqlEscape(application.forums) + '", "' + mysqlEscape(application.whatsapp) + '", "' + mysqlEscape(application.playstyle) + '", "' + application.days.toString() + '", "' + application.times.toString() + '", "' + mysqlEscape(application.questions) + '", NOW(), 0);', { type: sequelize.QueryTypes.INSERT })
                .then(function() {
                    for (var i = 0; i < results[2].length; i++) {
                        transporter.sendMail(mailMessage(results[2][i].email,
                            "New application waiting for your approval\n\n" +
                            "First Name: " + mysqlEscape(application.firstName) + "\n" +
                            "Gender: " + mysqlEscape(application.gender) + "\n" +
                            "Country: " + mysqlEscape(application.country) + "\n" +
                            "Birthday: " + mysqlEscape(application.birthday) + "\n" +
                            "Info: " + mysqlEscape(application.info) + "\n" +
                            "Username: " + mysqlEscape(application.username) + "\n" +
                            "Email: " + mysqlEscape(application.email) + "\n" +
                            "Guild Wars 2 Account: " + mysqlEscape(application.gw2name) + "\n" +
                            "Guild Wars 2 Version: " + mysqlEscape(application.gw2version) + "\n" +
                            "What are you looking for in a guild?: " + mysqlEscape(application.why) + "\n" +
                            "Teamspeak: " + mysqlEscape(application.ts) + "\n" +
                            "Forums: " + mysqlEscape(application.forums) + "\n" +
                            "Whatsapp: " + mysqlEscape(application.whatsapp) + "\n" +
                            "What's your playstyle like?: " + mysqlEscape(application.playstyle) + "\n" +
                            "Days: " + mysqlEscape(application.days.toString()) + "\n" +
                            "Times: " + mysqlEscape(application.times.toString()) + "\n" +
                            "Questions?: " + mysqlEscape(application.questions), 'GSD new application'), (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message %s sent: %s', info.messageId, info.response);
                        })
                    }
                    res.json({
                        success: true,
                        username: application.username,
                        gw2name: application.gw2name
                    });
                });
        } else {
            var usernameVar = "",
                gw2nameVar = "";
            if (!results[0]) {
                usernameVar = application.username;
            }
            if (!results[1]) {
                gw2nameVar = application.gw2name;
            }

            res.json({
                success: false,
                username: usernameVar,
                gw2name: gw2nameVar
            });
        }
    });
});

app.post('/login', function(req, res) {
    console.log(req.body);
    async.parallel([
            function(callback) {
                sequelizeCon.query('SELECT pwHash FROM user WHERE username = "' + mysqlEscape(req.body.username) + '";', { type: sequelize.QueryTypes.SELECT })
                    .then(function(loginResult) {
                        if (loginResult.length > 0) {
                            callback(null, loginResult[0]);
                        } else {
                            callback(null, { pwHash: "" });
                        }
                    });
            }
        ],
        function(err, results) {
            if (results[0].pwHash.length > 0) {
                if (bcrypt.compareSync(req.body.password, results[0].pwHash)) {
                    var sessionIDVar = bcrypt.hashSync(req.body.username);
                    sequelizeCon.query('INSERT INTO usersession(username, sessionID) VALUES("' + mysqlEscape(req.body.username) + '", "' + sessionIDVar + '");', { type: sequelize.QueryTypes.INSERT });
                    res.cookie("sessionID", sessionIDVar, {
                        httpOnly: true,
                        maxAge: 31536000000,
                        secure: true
                    });
                    res.json({ success: true })
                } else {
                    res.json({
                        success: false
                    });
                }
            } else {
                res.json({
                    success: false
                });
            }
            /*res.json({
                success: false
            });*/
        });
});

app.get('/logout', function(req, res) {
    sequelizeCon.query('DELETE FROM usersession WHERE sessionID= "' + req.cookies.sessionID + '";', { type: sequelize.QueryTypes.DELETE });
    res.clearCookie("sessionID");
    res.redirect('/home');
});

app.post('/getApplications', function(req, res) {
    async.parallel([
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT username, rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, null);
                            }
                        });
                } else {
                    callback(null, null);
                }
            }
        ],
        function(err, results) {
            console.log(results[0])
            if (results[0].username.length > 0 && results[0].rank === 2) {
                async.parallel([
                        function(callback) {
                            sequelizeCon.query('SELECT firstName, gender, country, CONVERT_TZ(birthday, "+00:00","+02:00") AS birthday, info,username, email, gw2name, gw2version, why, ts, forums, whatsapp, playstyle, days, times, questions,CONVERT_TZ(sentDate, "+00:00","+02:00") AS sentDate, acceptance FROM application ORDER BY DATE(sentDate) DESC;', { type: sequelize.QueryTypes.SELECT })
                                .then(function(checkResult) {
                                    if (checkResult.length > 0) {
                                        callback(null, checkResult);
                                    } else {
                                        callback(null, { application: "" });
                                    }
                                });
                        }
                    ],
                    function(err, results) {
                        if (results[0].length > 0) {
                            res.json({
                                success: true,
                                applications: results[0]
                            });
                        } else {
                            res.json({
                                success: false
                            });
                        }
                    }
                );

            } else {
                res.json({
                    success: false
                });
            }
        }
    );
});

app.get('/getArticles', function(req, res) {
    sequelizeCon.query('SELECT id, date, CONVERT(preview USING utf8) AS preview, CONVERT(content USING utf8) AS content, title, creator FROM articlesindex ORDER BY date DESC;', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                res.json({
                    success: true,
                    articles: checkResult
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
});

app.get('/getCarouselItems', function(req, res) {
    async.parallel([
            function(callback) {
                sequelizeCon.query('SELECT id, date, CONVERT(content USING utf8) AS content, CONVERT(image USING utf8) AS image, link FROM carousel;', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        if (checkResult.length > 0) {
                            callback(null, checkResult);
                        } else {
                            callback(null, { date: "" });
                        }
                    });
            }
        ],
        function(err, results) {
            if (results[0].length > 0) {
                res.json({
                    success: true,
                    carouselItems: results[0]
                });
            } else {
                res.json({
                    success: false
                });
            }
        }
    );
});

app.post('/changeCarouselItem', function(req, res) {
    if (req.cookies.sessionID.length > 0 && req.body.id.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);;', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('UPDATE carousel SET content = "' + mysqlEscape(req.body.content) + '", link = ' + mysqlEscape(req.body.link) + ', image = "' + mysqlEscape(req.body.image) + '" WHERE id = "' + mysqlEscape(req.body.id) + '";', { type: sequelize.QueryTypes.UPDATE });
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/addCarouselItem', function(req, res) {
    if (req.cookies.sessionID.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('INSERT INTO carousel (date, content, link, image) VALUES(NOW(), "' + mysqlEscape(req.body.content) + '", ' + mysqlEscape(req.body.link) + ', "' + mysqlEscape(req.body.image) + '");', { type: sequelize.QueryTypes.INSERT });
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/deleteCarouselItem', function(req, res) {
    if (req.cookies.sessionID.length > 0 && req.body.id.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);;', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('DELETE FROM carousel WHERE id = ' + mysqlEscape(req.body.id) + ';', { type: sequelize.QueryTypes.DELETE });
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/getCharacters', function(req, res) {
    if (req.cookies.sessionID != null) {
        sequelizeCon.query('SELECT username, characterName FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
            .then(function(userResult) {
                sequelizeCon.query('SELECT characterName FROM usercharacter WHERE username = "' + userResult[0].username + '";', { type: sequelize.QueryTypes.SELECT })
                    .then(function(checkResult) {
                        res.json({
                            success: true,
                            characterName: checkResult,
                            mainCharacter: userResult[0].characterName
                        });
                    });
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/changeArticle', function(req, res) {
    if (req.cookies.sessionID.length > 0 && req.body.title.length > 0 && req.body.content.length > 0 && req.body.id.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('UPDATE articlesindex SET title = "' + mysqlEscape(req.body.title) + '", preview = "' + mysqlEscape(req.body.preview) + '", content = "' + mysqlEscape(req.body.content) + '" WHERE id = ' + req.body.id + ';', { type: sequelize.QueryTypes.UPDATE });
                    }
                }
            });
    }
    res.redirect('back');
});

app.post('/addArticle', function(req, res) {
    if (req.body.title.length > 0 && req.body.content.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank, username FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1", username: "" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1", username: "" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('INSERT INTO articlesindex (date, preview, content, title, creator) VALUES(NOW(), "' + mysqlEscape(req.body.preview) + '", "' + mysqlEscape(req.body.content) + '", "' + mysqlEscape(req.body.title) + '", "' + mysqlEscape(results[0].username) + '");', { type: sequelize.QueryTypes.INSERT });
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/deleteArticle', function(req, res) {
    if (req.body.id.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('DELETE FROM articlesindex WHERE id = ' + mysqlEscape(req.body.id) + ';', { type: sequelize.QueryTypes.DELETE });
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/addCharacter', function(req, res) {
    if (req.body.characterName.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID) {
                        sequelizeCon.query('SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username;', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                callback(null, checkResult[0]);
                            })
                    } else {
                        callback(null, "");
                    }
                },
                function(callback) {
                    sequelizeCon.query('SELECT name FROM gsd.character WHERE name = "' + req.body.characterName + '";', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { name: "" });
                            }
                        });
                }
            ],
            function(err, results) {
                console.log(results);
                if (!results[1].name.length > 0) {
                    if (results[0].username.length > 0) {
                        async.parallel([
                                function(callback) {
                                    sequelizeCon.query('INSERT INTO gsd.character (name) VALUES ("' + req.body.characterName + '");', { type: sequelize.QueryTypes.INSERT })
                                        .then(function(checkResult) {
                                            callback(null);
                                        });
                                }
                            ],
                            function() {
                                sequelizeCon.query('INSERT INTO usercharacter (characterName, username) VALUES ("' + req.body.characterName + '", "' + results[0].username + '");', { type: sequelize.QueryTypes.INSERT })
                                    .then(function(checkResult) {
                                        res.json({
                                            success: true
                                        });
                                    });
                            }
                        );
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/changePassword', function(req, res) {
    async.parallel([
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT pwHash FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { pwHash: "" });
                            }
                        });
                } else {
                    callback(null, { pwHash: "" });
                }
            }
        ],
        function(err, results) {
            if (results[0].pwHash.length > 0) {
                if (bcrypt.compareSync(req.body.oldPassword, results[0].pwHash)) {
                    if (validatePassword(req.body.newPassword)) {
                        if (req.body.newPassword === req.body.confirm) {
                            if (req.cookies.sessionID != null) {
                                async.parallel([
                                        function(callback) {
                                            sequelizeCon.query('UPDATE user SET pwHash="' + bcrypt.hashSync(req.body.newPassword) + '" WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.UPDATE })
                                                .then(function(checkResult) {
                                                    callback(null, { success: "" });
                                                });
                                        }
                                    ],
                                    function(err, results) {
                                        res.json({
                                            success: true,
                                            opCheck: true,
                                            npCheck: true,
                                            equal: true
                                        });
                                    }
                                );
                            } else {
                                res.json({
                                    success: false,
                                    opCheck: true,
                                    npCheck: true,
                                    equal: false
                                });
                            }
                        } else {
                            res.json({
                                success: false,
                                opCheck: true,
                                npCheck: true,
                                equal: false
                            });
                        }
                    } else {
                        res.json({
                            success: false,
                            opCheck: true,
                            npCheck: false
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        opCheck: false
                    });
                }
            } else {
                res.json({
                    success: false
                });
            }
        }
    );
});

app.post('/changeEmail', function(req, res) {
    async.parallel([
            function(callback) {
                if (req.cookies.sessionID) {
                    sequelizeCon.query('SELECT email FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { email: "" });
                            }
                        });
                } else {
                    callback(null, { email: "" });
                }
            }
        ],
        function(err, results) {
            if (results[0].email.length > 0) {
                if (validateEmail(req.body.newEmail)) {
                    if (req.body.newEmail === req.body.confirmEmail) {
                        if (req.cookies.sessionID != null) {
                            async.parallel([
                                    function(callback) {
                                        sequelizeCon.query('UPDATE user SET email="' + req.body.newEmail + '" WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.UPDATE })
                                            .then(function(checkResult) {
                                                callback(null, { success: "" });
                                            });
                                    }
                                ],
                                function(err, results) {
                                    res.json({
                                        success: true,
                                        neCheck: true
                                    });
                                }
                            );
                        } else {
                            res.json({
                                success: false,
                                neCheck: false
                            });
                        }
                    } else {
                        res.json({
                            success: false,
                            neCheck: false
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        opCheck: false
                    });
                }

            } else {
                res.json({
                    success: false
                });
            }
        }
    );
});

app.post('/getUsers', function(req, res) {
    sequelizeCon.query('SELECT displayname, characterName, joinDate, country, steam, gender, birthday, rank FROM user;', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                res.json({
                    success: true,
                    users: checkResult
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
});

app.post('/getUsersAdmin', function(req, res) {
    if (req.cookies.sessionID.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('SELECT username, displayname, characterName, email, joinDate, country, steam, gender, birthday, rank FROM user;', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    res.json({
                                        success: true,
                                        users: checkResult
                                    });
                                } else {
                                    res.json({
                                        success: false
                                    });
                                }
                            });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    }
});

app.post('/changeRank', function(req, res) {
    if (req.cookies.sessionID.length > 0 && req.body.username.length > 0 && req.body.rank.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('UPDATE user SET rank = "' + mysqlEscape(req.body.rank) + '" WHERE username = "' + req.body.username + '";', { type: sequelize.QueryTypes.UPDATE })
                            .then(function() {
                                res.json({
                                    success: true
                                });
                            });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.get('/getAboutUs', function(req, res) {
    sequelizeCon.query('SELECT CONVERT(aboutUs USING utf8) AS aboutUs FROM aboutus WHERE id = 1;', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                res.json({
                    success: true,
                    aboutUs: checkResult[0].aboutUs
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
});

app.post('/saveAboutUs', function(req, res) {
    if (req.cookies.sessionID.length > 0 && req.body.aboutUs.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('UPDATE aboutus SET aboutUs = "' + mysqlEscape(req.body.aboutUs) + '" WHERE id = 1;', { type: sequelize.QueryTypes.UPDATE })
                            .then(function() {
                                res.json({
                                    success: true
                                });
                            });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.get('/getBackground', function(req, res) {
    sequelizeCon.query('SELECT CONVERT(backgroundImg USING utf8) AS backgroundImg FROM background WHERE id = 1;', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            if (checkResult.length > 0) {
                res.json({
                    success: true,
                    backgroundImg: checkResult[0].backgroundImg
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
});

app.post('/changeBackground', function(req, res) {
    if (req.cookies.sessionID.length > 0 && req.body.backgroundImg.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID != null) {
                        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                if (checkResult.length > 0) {
                                    callback(null, checkResult[0]);
                                } else {
                                    callback(null, { rank: "-1" });
                                }
                            });
                    } else {
                        callback(null, { rank: "-1" });
                    }
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('UPDATE background SET backgroundImg = "' + mysqlEscape(req.body.backgroundImg) + '" WHERE id = 1;', { type: sequelize.QueryTypes.UPDATE })
                            .then(function() {
                                res.json({
                                    success: true
                                });
                            });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/deleteCharacter', function(req, res) {
    if (req.cookies.sessionID.length > 0 && req.body.character.length > 0) {
        async.parallel([
                function(callback) {
                    if (req.cookies.sessionID) {
                        sequelizeCon.query('SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username;', { type: sequelize.QueryTypes.SELECT })
                            .then(function(checkResult) {
                                callback(null, checkResult[0]);
                            })
                    } else {
                        callback(null, "");
                    }
                },
                function(callback) {
                    sequelizeCon.query('SELECT username FROM usercharacter WHERE characterName = "' + mysqlEscape(req.body.character) + '";', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { username: "" });
                            }
                        });
                }
            ],
            function(err, results) {
                if (results[0].username.length > 0) {
                    if (results[0].username === results[1].username) {
                        sequelizeCon.query('DELETE FROM gsd.character WHERE name = "' + mysqlEscape(req.body.character) + '";', { type: sequelize.QueryTypes.DELETE })
                            .then(function() {
                                res.json({
                                    success: true
                                });
                            });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/changeMainCharacter', function(req, res) {
    if (req.cookies.sessionID != null) {
        sequelizeCon.query('UPDATE user SET characterName = "' + mysqlEscape(req.body.mainCharacter) + '" WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.UPDATE })
            .then(function() {
                res.json({
                    success: true
                });
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/getSteam', function(req, res) {
    if (req.cookies.sessionID != null) {
        sequelizeCon.query('SELECT steam FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
            .then(function(checkResult) {
                res.json({
                    success: true,
                    steam: checkResult[0].steam
                });
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/changeSteam', function(req, res) {
    if (req.cookies.sessionID) {
        sequelizeCon.query('UPDATE user SET steam = "' + mysqlEscape(req.body.steam) + '" WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.UPDATE })
            .then(function() {
                res.json({
                    success: true
                });
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.get('/images/:name', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/images/', req.params.name));
});

app.post('/approveApplication', function(req, res) {
    if (req.cookies.sessionID != null && req.body.feedback.length > 0 && req.body.sentDate.length > 0) {
        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
            .then(function(checkResult) {
                if (checkResult[0].rank === 2) {
                    async.parallel([
                            function(callback) {
                                sequelizeCon.query('UPDATE application SET acceptance = 1 WHERE sentDate = "' + mysqlEscape(req.body.sentDate.substring(0, 10).split('-').join('-') + " " + req.body.sentDate.substring(11, 19)) + '";', { type: sequelize.QueryTypes.UPDATE })
                                    .then(function(checkResult) {
                                        callback(null, null);
                                    });
                            },
                            function(callback) {
                                sequelizeCon.query('SELECT username, gender, country, CONVERT(birthday, CHAR) AS birthday, email, password FROM application WHERE sentDate = "' + mysqlEscape(req.body.sentDate.substring(0, 10).split('-').join('-') + " " + req.body.sentDate.substring(11, 19)) + '";', { type: sequelize.QueryTypes.SELECT })
                                    .then(function(checkResult) {
                                        callback(null, checkResult[0]);
                                    });
                            },
                        ],
                        function(err, results) {
                            sequelizeCon.query('INSERT INTO user( username, displayname, totalPosts, joinDate, lastSeen, gender, country, birthday, email, pwHash, rank ) VALUES ("' + results[1].username + '", "' + results[1].username + '", 0, NOW(), NOW(), "' + results[1].gender + '", "' + results[1].country + '", "' + results[1].birthday + '", "' + results[1].email + '", "' + results[1].password + '", 0);', { type: sequelize.QueryTypes.INSERT })
                                .then(function() {
                                    transporter.sendMail(mailMessage(results[1].email, "Application was approved\n\n" + req.body.feedback, 'GSD application'), (error, info) => {
                                        if (error) {
                                            return console.log(error);
                                        }
                                        console.log('Message %s sent: %s', info.messageId, info.response);
                                    })
                                });
                        });
                }
            });
    }
    res.end();
});

app.post('/declineApplication', function(req, res) {
    if (req.cookies.sessionID != null && req.body.feedback.length > 0 && req.body.sentDate.length > 0) {
        sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
            .then(function(checkResult) {
                if (checkResult[0].rank === 2) {
                    async.parallel([
                            function(callback) {
                                sequelizeCon.query('UPDATE application SET acceptance = -1 WHERE sentDate = "' + mysqlEscape(req.body.sentDate.substring(0, 10).split('-').join('-') + " " + req.body.sentDate.substring(11, 19)) + '";', { type: sequelize.QueryTypes.UPDATE })
                                    .then(function(checkResult) {
                                        callback(null, null);
                                    });
                            },
                            function(callback) {
                                sequelizeCon.query('SELECT email FROM application WHERE sentDate = "' + mysqlEscape(req.body.sentDate.substring(0, 10).split('-').join('-') + " " + req.body.sentDate.substring(11, 19)) + '";', { type: sequelize.QueryTypes.SELECT })
                                    .then(function(checkResult) {
                                        callback(null, checkResult[0]);
                                    });
                            },
                        ],
                        function(err, results) {
                            transporter.sendMail(mailMessage(results[1].email, "Application was declined\n\n" + req.body.feedback, 'GSD application'), (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log('Message %s sent: %s', info.messageId, info.response);
                            })
                        });
                }
            });
    }
    res.end();
});

app.get('/getCategories', function(req, res) {
    sequelizeCon.query('SELECT * from category;', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            res.json({
                categories: checkResult
            });
        });
});

app.get('/getSubCategories', function(req, res) {
    sequelizeCon.query('SELECT * from subcategory;', { type: sequelize.QueryTypes.SELECT })
        .then(function(checkResult) {
            res.json({
                subcategories: checkResult
            });
        });
});

app.post('/changeCategory', function(req, res) {
    if (req.cookies.sessionID != null && req.body.name.length > 0 && req.body.oldname.length > 0) {
        async.parallel([
                function(callback) {
                    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { rank: "-1" });
                            }
                        });
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('UPDATE category SET name = "' + mysqlEscape(req.body.name) + '", description = "' + mysqlEscape(req.body.description) + '" WHERE name = "' + mysqlEscape(req.body.oldname) + '";', { type: sequelize.QueryTypes.UPDATE })
                            .then(function() {
                                res.json({
                                    success: true
                                });
                            });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/changeSubCategory', function(req, res) {
    if (req.cookies.sessionID != null && req.body.name.length > 0 && req.body.oldname.length > 0) {
        async.parallel([
                function(callback) {
                    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { rank: "-1" });
                            }
                        });
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('UPDATE subcategory SET name = "' + mysqlEscape(req.body.name) + '", description = "' + mysqlEscape(req.body.description) + '", superCategory = "' + mysqlEscape(req.body.category) + '" WHERE name = "' + mysqlEscape(req.body.oldname) + '";', { type: sequelize.QueryTypes.UPDATE })
                            .then(function() {
                                res.json({
                                    success: true
                                });
                            });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/addSubCategory', function(req, res) {
    if (req.cookies.sessionID != null && req.body.name.length > 0) {
        async.parallel([
                function(callback) {
                    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { rank: "-1" });
                            }
                        });
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('INSERT INTO subcategory (name, description, superCategory) VALUES ("' + mysqlEscape(req.body.name) + '", "' + mysqlEscape(req.body.description) + '", "' + mysqlEscape(req.body.category) + '");', { type: sequelize.QueryTypes.INSERT })
                            .then(function() {
                                res.json({
                                    success: true
                                });
                            });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/addCategory', function(req, res) {
    if (req.cookies.sessionID != null && req.body.name.length > 0) {
        async.parallel([
                function(callback) {
                    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { rank: "-1" });
                            }
                        });
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('INSERT INTO category (name, description) VALUES ("' + mysqlEscape(req.body.name) + '", "' + mysqlEscape(req.body.description) + '");', { type: sequelize.QueryTypes.INSERT })
                            .then(function() {
                                res.json({
                                    success: true
                                });
                            });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/deleteCategory', function(req, res) {
    if (req.cookies.sessionID != null && req.body.name.length > 0) {
        async.parallel([
                function(callback) {
                    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { rank: "-1" });
                            }
                        });
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('DELETE FROM category WHERE name = "' + mysqlEscape(req.body.name) + '";', { type: sequelize.QueryTypes.DELETE });
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/deleteSubCategory', function(req, res) {
    if (req.cookies.sessionID != null && req.body.name.length > 0) {
        async.parallel([
                function(callback) {
                    sequelizeCon.query('SELECT rank FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { rank: "-1" });
                            }
                        });
                }
            ],
            function(err, results) {
                if (!results[0].rank.length > 0) {
                    if (results[0].rank === 2) {
                        sequelizeCon.query('DELETE FROM subcategory WHERE name = "' + mysqlEscape(req.body.name) + '";', { type: sequelize.QueryTypes.DELETE });
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                } else {
                    res.json({
                        success: false
                    });
                }
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/createDiscussion', function(req, res) {
    var pageInfo = req.headers.referer.split("/");
    async.parallel([
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT rank, username FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { rank: "-1" });
                            }
                        });
                } else {
                    callback(null, { rank: "-1" });
                }
            }
        ],
        function(err, results) {
            if (results[0].rank >= 0 && req.body.name.length > 0) {
                sequelizeCon.query('INSERT INTO discussion(name, creator, superSubCategory) VALUES("' + mysqlEscape(req.body.name) + '", "' + results[0].username + '", "' + mysqlEscape(pageInfo[5]) + '");', { type: sequelize.QueryTypes.INSERT })
                    .then(function(checkResult) {
                        res.redirect('back');
                    });
            }
        });
});

app.post('/postComment', function(req, res) {
    var pageInfo = req.headers.referer.split("/");
    async.parallel([
            function(callback) {
                if (req.cookies.sessionID != null) {
                    sequelizeCon.query('SELECT rank, username FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { rank: "-1" });
                            }
                        });
                } else {
                    callback(null, { rank: "-1" });
                }
            }
        ],
        function(err, results) {
            if (results[0].rank >= 0) {
                sequelizeCon.query('INSERT INTO comment(comment, creator, superDiscussionID) VALUES("' + mysqlEscape(req.body.comment) + '", "' + results[0].username + '", "' + mysqlEscape(pageInfo[6]) + '");', { type: sequelize.QueryTypes.INSERT })
                    .then(function(checkResult) {
                        res.redirect('back');
                    });
            }
        });
});

app.post('/changeComment', function(req, res) {
    //signIn controle
    console.log(req);
    var t = req.body.date.split(/[- :]/);
    sequelizeCon.query('UPDATE comment SET editDate = NOW(), comment="' + mysqlEscape(req.body.message) + '" WHERE sentDate = STR_TO_DATE("' + req.body.date + '", "%d-%m-%Y %T");')
    res.send("true");
});

var validatePassword = function(password) {
    var re = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&?* "]).*$/;
    return re.test(password);
};

var validateEmail = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

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

var urlEscape = function(stringToReset) {
    return stringToReset
        .replace(/%20/gi, " ")
        .replace(/%24/gi, "$")
        .replace(/%26/gi, "&")
        .replace(/%60/gi, "`")
        .replace(/%3A/gi, ":")
        .replace(/%3C/gi, "<")
        .replace(/%3E/gi, ">")
        .replace(/%5B/gi, "[")
        .replace(/%5D/gi, "]")
        .replace(/%7B/gi, "{")
        .replace(/%7D/gi, "}")
        .replace(/%22/gi, '"')
        .replace(/%2B/gi, "+")
        .replace(/%23/gi, "#")
        .replace(/%25/gi, "%")
        .replace(/%40/gi, "@")
        .replace(/%2F/gi, "/")
        .replace(/%3B/gi, ";")
        .replace(/%3D/gi, "=")
        .replace(/%3F/gi, "?")
        .replace(/%5C/gi, "\\")
        .replace(/%5E/gi, "^")
        .replace(/%7C/gi, "|")
        .replace(/%7E/gi, "~")
        .replace(/%27/gi, "‘")
        .replace(/%2C/gi, ",");

};

var mailMessage = function(email, message, subject) {
    var mailOptions = {
        from: 'gsdguild@gmail.com', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
    };
    return mailOptions;
};

app.post("/upload", function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.end("Something went wrong!");
        }
        res.json({
            imageName: "/images/" + req.file.filename
        });
        return res.end("File uploaded sucessfully!.");
    });
});

app.post("/uploadAvatar", function(req, res) {
    if (req.cookies.sessionID != null) {
        upload(req, res, function(err) {
            if (err) {
                console.log(err);
                return res.end("Something went wrong!");
            }
            res.json({
                imageName: "/images/" + req.file.filename
            });
            sequelizeCon.query('UPDATE user SET avatar="' + ("/images/" + req.file.filename) + '" WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.UPDATE });
            return res.end("File uploaded sucessfully!.");
        });
    } else {
        res.end("File upload failed");
    }
});

app.get("/submitPassRequest", function(req, res) {
    if (validateEmail(req.query.email)) {
        async.parallel([
                function(callback) {
                    sequelizeCon.query('SELECT username FROM user WHERE email = "' + mysqlEscape(req.query.email) + '";', { type: sequelize.QueryTypes.SELECT })
                        .then(function(checkResult) {
                            if (checkResult.length > 0) {
                                callback(null, checkResult[0]);
                            } else {
                                callback(null, { username: "" });
                            }
                        });
                }
            ],
            function(err, results) {
                if (results[0].username.length > 0) {
                    var token = mysqlEscape(numbGenerator.string({
                        pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                        length: 15
                    }));
                    sequelizeCon.query('UPDATE user SET resetToken = "' + bcrypt.hashSync(token) + '" WHERE email = "' + mysqlEscape(req.query.email) + '";', { type: sequelize.QueryTypes.UPDATE })
                        .then(function() {
                            res.json({
                                message: "Request received. You should get an email shortly.",
                                success: true
                            });
                            transporter.sendMail(mailMessage(mysqlEscape(req.query.email), "Click on the following link to change your password: " + req.headers.referer + "/" + token + "\n\n If you did not request this reset, you can ignore this email", 'GSD forgotten password'), (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log('Message %s sent: %s', info.messageId, info.response);
                            })
                        });
                } else {
                    res.json({
                        message: "User not found",
                        success: false
                    });
                }
            });
    } else {
        res.json({
            message: "Input is not an email",
            success: false
        });
    }
});

app.post("/resetPass", function(req, res) {
    if (validatePassword(req.body.password)) {
        if (req.body.password === req.body.confirmpassword) {
            sequelizeCon.query('SELECT resetToken, username from user where resetToken is not null;', { type: sequelize.QueryTypes.SELECT })
                .then(function(checkResult) {
                    for (var i = 0; i < checkResult.length; i++) {
                        if (bcrypt.compareSync(req.body.token, checkResult[i].resetToken)) {
                            sequelizeCon.query('UPDATE user SET resetToken = NULL, pwHash = "' + bcrypt.hashSync(req.body.password) + '" WHERE username = "' + checkResult[i].username + '";', { type: sequelize.QueryTypes.UPDATE })
                                .then(function() {
                                    i = checkResult.length;
                                });
                        }
                    }
                    res.json({
                        message: "Password has been changed",
                        success: true
                    });
                });
        } else {
            res.json({
                message: "Passwords are not the same",
                success: false
            });
        }
    } else {
        res.json({
            message: "Password has to contain at least 1 digit, 1 lowercase letter, 1 uppercase letter, a special character and has to be at least 8 characters long!",
            success: false
        });
    }
});

app.post("/deleteDiscussion", function(req, res) {
    if (req.cookies.sessionID != null) {
        sequelizeCon.query('SELECT rank, username FROM user WHERE username = (SELECT username FROM usersession WHERE sessionID = "' + mysqlEscape(req.cookies.sessionID) + '" GROUP BY username);', { type: sequelize.QueryTypes.SELECT })
            .then(function(checkResult) {
                if (checkResult[0].rank > 0) {
                    if (!isNaN(mysqlEscape(req.body.id))) {
                        sequelizeCon.query('DELETE FROM discussionuser WHERE id="' + mysqlEscape(req.body.id) + '";', { type: sequelize.QueryTypes.DELETE })
                            .then(function() {
                                sequelizeCon.query('DELETE FROM discussion WHERE id="' + mysqlEscape(req.body.id) + '";', { type: sequelize.QueryTypes.DELETE })
                                    .then(function() {
                                        res.send("");
                                    })
                            });
                    }
                }
            });
    } else {
        res.send("");
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;