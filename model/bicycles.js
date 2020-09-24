const tool = require('../util/tool');
const knex = require("../db/knex.js");

const findPKey = function (pkey, callback) {
    (async function () {
        const client = knex.connect();
        await client.from("bicycles").where({ id: pkey })
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const find = function (callback) {
    (async function () {
        const client = knex.connect();
        await client.from("bicycles").orderBy("id", "asc")
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const findForAdmin = function (callback) {
    (async function () {
        const query = 'SELECT b.*, re.ymd_start AS relation_ymd_start, re.ymd_end AS relation_ymd_end, c.name AS companyname FROM bicycles b LEFT OUTER JOIN relation_combicycle re ON re.ymd_end = "99991231" AND b.id = re.id_bicycle LEFT OUTER JOIN companies c ON re.id_company = c.id';
        const client = knex.connect();
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const insert = function (inObj, callback) {
    (async function () {
        const query = 'insert into bicycles values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.name) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        logger.info('[' + inObj.id_upd + ']' + query);
        const client = knex.connect();
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
        const query = 'update bicycles set name = ' + tool.returnvalue(inObj.name) + ', ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "' + inObj.before_ymd_end + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        const client = knex.connect();
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const remove = function (inObj, callback) {
    (async function () {
        const query = 'delete from bicycles where id = "' + inObj.id + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        const client = knex.connect();
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
    find,
    findForAdmin,
    findPKey,
    insert,
    update,
    remove,
};