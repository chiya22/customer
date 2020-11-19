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
    selectSQL,
};