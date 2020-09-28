const tool = require('../util/tool');
const knex = require("../db/knex.js");
const client = knex.connect();

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const findPKey = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        await client.from("companies").where({ id: inObj.id, ymd_end: "99991231" })
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
        await client.from("companies").where({ ymd_end: "99991231" }).orderBy("id", "asc")
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const findForSelect = function (callback) {
    (async function () {
        const query = 'select id, kubun_company, id_nyukyo, name, ymd_nyukyo, ymd_kaiyaku from companies where ymd_end = "99991231" order by id_nyukyo asc'
        // const client = knex.connect();
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
}

const findByNyukyo = function (id_nyukyo, callback) {
    (async function () {
        // const client = knex.connect();
        await client.from('companies').where({ id_nyukyo: id_nyukyo, ymd_end: '99991231' }).orderBy("ymd_kaiyaku", "asc")
            .then((retObj) => {
                callback(null, retObj);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const findByNyukyoWithoutKaiyaku = function (id_nyukyo, callback) {
    (async function () {
        // const client = knex.connect();
        await client.from('companies').where({ id_nyukyo: id_nyukyo, ymd_kaiyaku: '99991231' }).orderBy("ymd_kaiyaku", "asc")
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const findLikeCount = function (likevalue, callback) {
    (async function () {
        const query = 'select count(*) as count_all from companies where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231"';
        // const client = knex.connect();
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const findLikeForPaging = function (likevalue, percount, offset, callback) {
    (async function () {
        const query = 'select * from companies where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231" limit ' + percount + ' offset ' + offset + ' order by id asc';
        // const client = knex.connect();
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
        const query = 'insert into companies values ("' + inObj.id + '",' + tool.returnvalue(inObj.id_nyukyo) + ',' + tool.returnvalue(inObj.id_kaigi) + ',"' + inObj.kubun_company + '","' + inObj.name + '", "' + inObj.name_other + '", ' + tool.returnvalue(inObj.kana) + ',"' + inObj.ymd_nyukyo + '","99991231","' + inObj.ymd_start + '","99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '", ' + tool.returnvalue(inObj.bikou) + ')';
        logger.info('[' + inObj.id_upd + ']' + query);
        // const client = knex.connect();
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
        const query = 'update companies set kubun_company = ' + tool.returnvalue(inObj.kubun_company) + ', id_nyukyo = ' + tool.returnvalue(inObj.id_nyukyo) + ', id_kaigi = ' + tool.returnvalue(inObj.id_kaigi) + ', name = ' + tool.returnvalue(inObj.name) + ', name_other = ' + tool.returnvalue(inObj.name_other) + ', kana = ' + tool.returnvalue(inObj.kana) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ', ymd_nyukyo = "' + inObj.ymd_nyukyo + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = "' + inObj.id + '" and ymd_end = "99991231"';
        logger.info('[' + inObj.id_upd + ']' + query);
        // const client = knex.connect();
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
        const query = 'update companies set ymd_end = "' + inObj.ymd_end + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '" where id = "' + inObj.id + '" and ymd_end ="99991231"';
        logger.info('[' + inObj.id_upd + ']' + query);
        // const client = knex.connect();
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const cancel = function (inObj, callback) {
    (async function () {
        const query = 'update companies set ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "99991231"';
        logger.info('[' + inObj.id_upd + ']' + query);
        // const client = knex.connect();
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
}

const selectSQL = function (sql, callback) {
    (async function () {
        // const client = knex.connect();
        await client.raw(sql)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
}


module.exports = {
    find,
    findPKey,
    findForSelect,
    findByNyukyo,
    findByNyukyoWithoutKaiyaku,
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    remove,
    cancel,
    selectSQL,
};