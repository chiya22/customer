const tool = require('../util/tool');
const knex = require("../db/knex.js");
const client = knex.connect();

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const findAll = (callback) => {
    (async () => {
        // const client = knex.connect();
        await client.from("perinfo").orderBy("yyyymm", "desc")
            .then((retObj) => {
                callback(null, retObj);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const findPKey = (inObj, callback) => {
    (async () => {
        // const client = knex.connect();
        await client.from("perinfo").where({ yyyymm: inObj.yyyymm })
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const insert = (inObj, callback) => {
    (async () => {
        const query = 'insert into perinfo values ("' + inObj.yyyymm + '",' + inObj.per_all_all + ',' + inObj.per_all_weekday + ',' + inObj.per_all_holiday + ',' + inObj.per_45_all + ',' + inObj.per_45_weekday + ',' + inObj.per_45_holiday + ',' + inObj.per_mtg_all + ',' + inObj.per_mtg_weekday + ',' + inObj.per_mtg_holiday + ',' + inObj.per_prj_all + ',' + inObj.per_prj_weekday + ',' + inObj.per_prj_holiday + ',"' + inObj.ymd_add + '")';
        await logger.info('[' + inObj.yyyymm + ']' + query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })

    })();
};

const remove = (inObj, callback) => {
    (async () => {
        // const client = knex.connect();
        const query = 'delete from perinfo where yyyymm = "' + inObj.yyyymm + '"';
        logger.info('[' + inObj.yyyymm + ']' + query);
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
    findAll,
    findPKey,
    insert,
    remove,
};