const knex = require("../db/knex.js");

const findPKey = ((username, callback) => {
    (async function () {
        const client = knex.connect();
        await client.from("users").where({
            id: username,
            // ymd_end: "99991231",
        })
        .then( (retObj) => {
            callback(null, retObj);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
});

const find = ( (callback) => {
    (async function () {
        const client = knex.connect();
        await client.from("users").orderBy("id","asc")
        .then( (retObj) => {
            callback(null, retObj);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
})

const insert = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'insert into users values ("' + inObj.id + '","' + inObj.name + '","' + inObj.pwd + '","' + inObj.role + '", "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err) => {
            callback(err, null);
        });
    })();
};

const update = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'update users set name = "' + inObj.name + '", password = "' + inObj.password + '", role = "' + inObj.role + '", ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_ymd + '" where id = "' + inObj.id + '" and ymd_end = "' + inObj.before_ymd_end + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err) => {
            callback(err, null);
        });
    })();
}

const remove = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'delete from users where id = "' + inObj.id + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

module.exports = {
    find: find,
    findPKey: findPKey,
    insert: insert,
    update: update,
    remove: remove,
};