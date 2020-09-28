const knex = require("../db/knex.js");
const client = knex.connect();

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const findPKey = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        await client.from("relation_nyucabi").where({
            id_nyukyo: inObj.id_nyukyo,
            id_cabinet: inObj.id_cabinet,
            no_seq: inObj.no_seq,
        })
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            });
    })();
};

const findByNyukyo = function (id_nyukyo, callback) {
    (async function () {
        // const client = knex.connect();
        // const query = 'select * from relation_nyucabi AS a INNER JOIN cabinets AS b ON a.id_cabinet = b.id where a.id_nyukyo = "' + id_nyukyo + '" and a.ymd_end = "99991231" and b.ymd_end = "99991231" order by b.id asc'
        const query = 'select a.id_nyukyo, a.id_cabinet, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.place, b.name from relation_nyucabi AS a INNER JOIN cabinets AS b ON a.id_cabinet = b.id where a.id_nyukyo = "' + id_nyukyo + '" and b.ymd_end = "99991231" order by b.id asc'
        await client.raw(query)
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
        await client.from("relation_nyucabi").where({ ymd_end: "99991231" }).orderBy([{ column: "id_nyukyo", order: "asc" }, { column: "id_cabinet", order: "asc" }])
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            });
    })();
};

const findFree = function (callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'SELECT c.id, c.place, c.name, c.ymd_start, c.ymd_end FROM cabinets AS c WHERE c.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_nyucabi AS re WHERE c.id = re.id_cabinet and re.ymd_end = "99991231" ) order by c.id asc';
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
}

const insert = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'insert into relation_nyucabi values ("' + inObj.id_nyukyo + '","' + inObj.id_cabinet + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_nyucabi AS b WHERE b.id_nyukyo = "' + inObj.id_nyukyo + '" and b.id_cabinet = "' + inObj.id_cabinet + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
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
        const query = 'update relation_nyucabi set id_nyukyo = "' + inObj.id_nyukyo + '", id_cabinet = "' + inObj.id_cabinet + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_nyukyo = "' + inObj.id_nyukyo + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
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
        const query = 'update relation_nyucabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_nyukyo = "' + inObj.id_nyukyo + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
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

const cancelByNyukyo = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'update relation_nyucabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_nyukyo = "' + inObj.id_nyukyo + '" and ymd_end = "99991231"';
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
    findFree,
    findPKey,
    findByNyukyo,
    insert,
    update,
    remove,
    cancelByNyukyo,
};