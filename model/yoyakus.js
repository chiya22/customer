const tool = require('../util/tool');
const knex = require("../db/knex.js");
const client = knex.connect();

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const findPKey = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        await client.from("yoyakus").where({ id: inObj.id })
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};
const calcTime = ( inObj, callback) => {
    (async function () {

        let query = 'SELECT left(ymd_riyou,6) AS ymd, kubun_room, kubun_day AS kubun_day, sum(CAST(time_end AS SIGNED)-CAST(time_start AS SIGNED))/100 AS totaltime FROM yoyakus where left(ymd_riyou, 6) = "' + inObj.yyyymm + '" and id_riyousha <> "10001" and id_riyousha <> "00001" group BY left(ymd_riyou,6), kubun_room, kubun_day order by kubun_room, kubun_day'
        await logger.info('[' + inObj.yyyymm + ']' + query);
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

        const query = 'insert into yoyakus values ("' + inObj.id + '","' + inObj.ymd_add + '","' + inObj.ymd_riyou + '",' + tool.returnvalue(inObj.ymd_upd) + ',"' + inObj.nm_kubun_room + '","' + inObj.nm_room + '","' + inObj.time_yoyaku + '","' + inObj.time_start + '","' + inObj.time_end + '","' + inObj.id_riyousha + '","' + inObj.nm_riyousha + '","' + inObj.kana_riyousha + '",' + tool.returnvalue(inObj.no_yubin) + ',"' + inObj.address + '","' + inObj.email + '",' + tool.returnvalue(inObj.telno) + ',"' + inObj.mokuteki + '","' + inObj.nm_uketuke + '",' + inObj.num_person + ',' + inObj.price + ',' + tool.returnvalue(inObj.stat_shiharai) + ',' + tool.returnvalue(inObj.bikou) + ',"' + inObj.kubun_day + '","' + inObj.kubun_room + '")';
        await logger.info('[' + inObj.id + ']' + query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const deleteByMonth = function (target_yyyymm, callback) {
    (async function () {
        const query = 'delete from yoyakus where "' + target_yyyymm + '" = substring(id, 2, 6)';
        logger.info('[' + target_yyyymm + ']' + query);
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
    findPKey,
    calcTime,
    insert,
    deleteByMonth,
    selectSQL,
};