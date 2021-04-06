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

const selectAll = (callback) => {

    (async () => {
        const query = 'SELECT yyyymm, format(per_all_all,2) as per_all_all, format(per_all_weekday,2) as per_all_weekday, format(per_all_holiday,2) as per_all_holiday, format(per_45_all,2) as per_45_all, format(per_45_weekday,2) as per_45_weekday, format(per_45_holiday,2) as per_45_holiday, format(per_mtg_all,2) as per_mtg_all, format(per_mtg_weekday,2) as per_mtg_weekday, format(per_mtg_holiday,2) as per_mtg_holiday, format(per_prj_all,2) as per_prj_all, format(per_prj_weekday,2) as per_prj_weekday, format(per_prj_holiday,2) as per_prj_holiday, ymd_add FROM perinfo ORDER BY yyyymm desc'
        await logger.info(query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
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
    selectAll,
    insert,
    remove,
};