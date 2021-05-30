const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const hash = require("./hash.js").digest;

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

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
    logger.info('[LOGIN] username:' + username + ' password:' + password);

    async function main() {
        const retObj = await users.findPKey(username)
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
    }
    main();
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