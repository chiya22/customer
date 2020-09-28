const tool = require('../util/tool');
const knex = require("../db/knex.js");
const client = knex.connect();

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const findPKey = function (pkey, callback) {
    (async function () {
        // const client = knex.connect();
        await client.from("rooms").where({ id: pkey })
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const find = function (callback) {
    (async function () {
        // const client = knex.connect();
        await client.from("rooms").orderBy([{ column: "place", order: "asc" }, { column: "floor", order: "asc" }])
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const findForAdmin = function (callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'SELECT r.*,  c.name as companyname from rooms r left outer join relation_comroom re ON r.id = re.id_room AND r.ymd_end = "99991231" AND re.ymd_end = "99991231"  left outer join companies c ON re.id_company = c.id order BY r.place ASC, r.floor asc'
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const insert = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'insert into rooms values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.place) + ',' + tool.returnvalue(inObj.floor) + ',' + tool.returnvalue(inObj.person) + ',' + tool.returnvalue(inObj.name) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const update = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'update rooms set place = ' + tool.returnvalue(inObj.place) + ', floor = ' + tool.returnvalue(inObj.floor) + ', person = ' + inObj.person + ', name = ' + tool.returnvalue(inObj.name) + ', ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "' + inObj.before_ymd_end + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const remove = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'delete from rooms where id = "' + inObj.id + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
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