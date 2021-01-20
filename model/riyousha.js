const tool = require('../util/tool');
const knex = require("../db/knex.js");
const client = knex.connect();

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const findPKey = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        await client.from("riyoushas").where({ id: inObj.id })
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
        await client.from("riyoushas").orderBy("id", "asc")
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
        const query = 'select id, kubun, name from riyoushas order by id asc'
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

const findLikeCount = function (likevalue, callback) {
    (async function () {
        const query = 'select count(*) as count_all from riyoushas where ((id like "%' + likevalue + '%") or (name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%"))';
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
        const query = 'select * from riyoushas where ((id like "%' + likevalue + '%") or (name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) limit ' + percount + ' offset ' + offset + ' order by id asc';
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
        // const client = knex.connect();
        const query = 'insert into riyoushas values ("' + inObj.id + '","' + inObj.kubun + '","' + inObj.kubun2 + '","' + inObj.name + '",' + tool.returnvalue(inObj.kana) + ',' + tool.returnvalue(inObj.sex) + ',' + tool.returnvalue(inObj.no_yubin) + ',' + tool.returnvalue(inObj.address) + ',' + tool.returnvalue(inObj.no_tel) + ',' + tool.returnvalue(inObj.mail1) + ',' + tool.returnvalue(inObj.mail2) + ',' + tool.returnvalue(inObj.kubun_riyousha) + ',' + tool.returnvalue(inObj.kubun_vip) + ',' + tool.returnvalue(inObj.bikou) + ',' + tool.returnvalue(inObj.ymd_add) + ',' + tool.returnvalue(inObj.ymd_upd) + ')';
        logger.info('[' + inObj.ymd_add + ']' + query);
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
        const query = 'update riyoushas set kubun = ' + tool.returnvalue(inObj.kubun) + ', kubun2 = ' + tool.returnvalue(inObj.kubun2) + ', name = "' + inObj.name + '", kana = ' + tool.returnvalue(inObj.kana) + ', sex = ' + tool.returnvalue(inObj.sex) + ', no_yubin = ' + tool.returnvalue(inObj.no_yubin) + ', address = ' + tool.returnvalue(inObj.address) + ', no_tel = ' + tool.returnvalue(inObj.no_tel) + ', mail1 = ' + tool.returnvalue(inObj.mail1) + ', mail2 = ' + tool.returnvalue(inObj.mail2) + ', kubun_riyousha = ' + tool.returnvalue(inObj.kubun_riyousha) + ', kubun_vip = ' + tool.returnvalue(inObj.kubun_vip) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ', ymd_add = "' + inObj.ymd_add + '", ymd_upd = "' + inObj.ymd_upd + '" where id = ' + tool.returnvalue(inObj.id) + '';
        logger.info('[' + inObj.ymd_add + ']' + query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

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
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    selectSQL,
};