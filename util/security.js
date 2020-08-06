const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const hash = require("./hash.js").digest;
const connection = require('../db/mysqlconfig.js');


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use("local-strategy", new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
}, (req, username, password, done) => {
    const today = new Date();
    const dateinfo = today.getHours() + "時" + today.getMinutes() + "分" + ('0' +today.getSeconds()).slice(-2) + "秒";
    console.log(dateinfo + ")" + username + ':' + password);
    connection.query('select * from users where id = "' + username + '"', function (error, results, fields) {
        if (error) {
            done(error);
        } else {
            if (results.length === 0) {
                done(null, false, req.flash("message", "ユーザー名　または　パスワード　が間違っています。"));
            } else {
                if (results[0].password === hash(password)) {
                    console.log(username);
                    req.session.regenerate((err) => {
                        if (err) {
                            done(err);
                        } else {
                            done(null, results[0].id);
                        }
                    });
                } else {
                    done(null, false, req.flash("message", "ユーザー名　または　パスワード　が間違っています。"));
                }
            }
        };
    });
}));

const initialize = function () {
    return [
        passport.initialize(),
        passport.session(),
        function (req, res, next) {
            if (req.user) {
                res.locals.user = req.user;
            }
            next();
        }
    ];
};

const authenticate = function () {
    return passport.authenticate(
        "local-strategy", {
        successRedirect: "/",
        failureRedirect: "/login"
        }
    );
};

const authorize = function () {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect("/login");
        }
    };
};

module.exports = {
    initialize,
    authenticate,
    authorize,
};