const tool = require('../util/tool');
const knex = require("../db/knex.js");

const findPKey = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const retObj = await client.from("companies").where({ id: inObj.id, ymd_end: "99991231" }).catch((err) => { });
        callback(null, retObj[0]);
    })();
};

const find = function (callback) {
    (async function () {
        const client = knex.connect();
        const retObj = await client.from("companies").where({ ymd_end: "99991231" }).orderBy("id", "asc");
        callback(null, retObj[0]);
    })();
};

const findForSelect = function (callback) {
    (async function () {
        const query = 'select id, kubun_company, id_nyukyo, name, ymd_nyukyo, ymd_kaiyaku from companies where ymd_end = "99991231" order by id_nyukyo asc'
        const client = knex.connect();
        const retObj = await client.raw(query);
        callback(null, retObj[0]);
    })();
}

const findByNyukyo = function (id_nyukyo, callback) {
    (async function () {
        const client = knex.connect();
        const retObj = await client.from('companies').where({ id_nyukyo: id_nyukyo }).orderBy('ymd_kaiyaku', 'asc');
        callback(null, retObj);
    })();
};

const findByNyukyoWithoutKaiyaku = function (id_nyukyo, callback) {
    (async function () {
        const client = knex.connect();
        const retObj = await client.from('companies').where({ id_nyukyo: id_nyukyo, ymd_kaiyaku: '99991231' }).orderBy('ymd_kaiyaku', 'asc');
        callback(null, retObj);
    })();
};

const findLikeCount = function (likevalue, callback) {
    (async function () {
        const query = 'select count(*) as count_all from companies where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231"';
        const client = knex.connect();
        const retObj = await client.raw(query);
        callback(null, retObj[0]);
    })();
};

const findLikeForPaging = function (likevalue, percount, offset, callback) {
    (async function () {
        const query = 'select * from companies where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231" limit ' + percount + ' offset ' + offset + ' order by id asc';
        const client = knex.connect();
        const retObj = await client.raw(query);
        callback(null, retObj[0]);
    })();
};

const insert = function (inObj, callback) {
    (async function () {
        const query = 'insert into companies values ("' + inObj.id + '",' + tool.returnvalue(inObj.id_nyukyo) + ',' + tool.returnvalue(inObj.id_kaigi) + ',"' + inObj.kubun_company + '","' + inObj.name + '",' + tool.returnvalue(inObj.kana) + ',"' + inObj.ymd_nyukyo + '","99991231","' + inObj.ymd_start + '","99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '", ' + tool.returnvalue(inObj.bikou) + ')';
        const client = knex.connect();
        const retObj = await client.raw(query);
        callback(null, retObj[0]);
    })();
};

const update = function (inObj, callback) {
    (async function () {
        const query = 'update companies set kubun_company = ' + tool.returnvalue(inObj.kubun_company) + ', id_nyukyo = ' + tool.returnvalue(inObj.id_nyukyo) + ', id_kaigi = ' + tool.returnvalue(inObj.id_kaigi) + ', name = ' + tool.returnvalue(inObj.name) + ', kana = ' + tool.returnvalue(inObj.kana) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ', ymd_nyukyo = "' + inObj.ymd_nyukyo + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = "' + inObj.id + '" and ymd_end = "99991231"';
        const client = knex.connect();
        const retObj = await client.raw(query);
        callback(null, retObj[0]);
    })();
};

const remove = function (inObj, callback) {
    (async function () {
        const query = 'update companies set ymd_end = "' + inObj.ymd_end + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '" where id = "' + inObj.id + '" and ymd_end ="99991231"';
        const client = knex.connect();
        const retObj = await client.raw(query);
        callback(null, retObj[0]);
    })();
};

const cancel = function (inObj, callback) {
    (async function () {
        const query = 'update companies set ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "99991231"';
        const client = knex.connect();
        const retObj = await client.raw(query);
        callback(null, retObj[0]);
    })();
}

const selectSQL = function (sql, callback) {
    (async function () {
        const client = knex.connect();
        const retObj = await client.raw(sql);
        callback(null, retObj[0]);
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