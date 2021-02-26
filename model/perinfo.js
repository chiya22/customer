const tool = require('../util/tool');
const knex = require("../db/knex.js");
const client = knex.connect();

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const findAll = (callback) => {
    (async () => {
        // const client = knex.connect();
        await client.from("perinfo").orderBy("ymd", "desc")
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
        await client.from("perinfo").where({ ymd: inObj.ymd })
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
        const query = 'insert into perinfo values ("' + inObj.ymd + '",' + inObj.per_total + ',' + inObj.per_45 + ',' + inObj.per_mtg + ',' + inObj.per_prj + ')';
        await logger.info('[' + inObj.ymd + ']' + query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })

    })();
};

const update = (inObj, callback) => {
    (async () => {
        // const client = knex.connect();
        const query = 'update perinfo set per_total = ' + inObj.per_total + ', per_45 = ' + inObj.per_45 + ', per_mtg = ' + inObj.per_mtg + ', per_prj = ' + inObj.per_prj + ' where id = "' + inObj.ymd + '"';
        logger.info('[' + inObj.ymd + ']' + query);
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
    update,
};