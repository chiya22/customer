const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const hash = require("./hash.js").digest;

const users = require("../model/users");

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
    const dateinfo = today.getHours() + "時" + today.getMinutes() + "分" + ('0' + today.getSeconds()).slice(-2) + "秒";
    console.log(dateinfo + " ) " + 'username:' + username + ' password:' + password);

    users.findPKey(username, (err, retObj) => {
        if (err) { throw err };
        if (!retObj) {
            done(null, false, req.flash("message", "ユーザー名　または　パスワード　が間違っています。"));
        } else {
            if (retObj[0].password === hash(password)) {
                req.session.regenerate((err) => {
                    if (err) {
                        done(err);
                    } else {
                        done(null, retObj[0]);
                    }
                });
            } else {
                done(null, false, req.flash("message", "ユーザー名　または　パスワード　が間違っています。"));
            }
        }
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