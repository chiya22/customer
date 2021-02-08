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

const insert = function (inObj, callback) {
    (async function () {

        const query = 'insert into yoyakus values ("' + inObj.id + '","' + inObj.nm_room + '","' + inObj.ymd_yoyaku + '","' + inObj.time_start + '","' + inObj.time_end + '",' + inObj.price + ',"' + inObj.ymd_uketuke + '","' + inObj.status_pay + '",' + tool.returnvalue(inObj.nm_input) + ',"' + inObj.nm_riyousha + '","' + inObj.seishikinm_room + '","' + inObj.type_room + '","' + inObj.id_keiyaku + '","' + inObj.nm_keiyaku + '","' + inObj.nm_tantou + '",' + tool.returnvalue(inObj.telno) + ',' + tool.returnvalue(inObj.faxno) + ',"' + inObj.email + '","' + inObj.kubun + '","' + inObj.address + '",' + tool.returnvalue(inObj.quantity) + ',' + tool.returnvalue(inObj.unit) + ',' + tool.returnvalue(inObj.notes) + ',' + tool.returnvalue(inObj.bikou) + ')';
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
    insert,
    deleteByMonth,
    selectSQL,
};