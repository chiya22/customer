const tool = require('../util/tool');
const knex = require("../db/knex.js");
const client = knex.connect();

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const findPKey = function (pkey, callback) {
    (async function () {
        // const client = knex.connect();
        await client.from("cabinets").where({id: pkey})
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err)=> {
            callback(err, null);
        })
    })();
};

const find = function (callback) {
    (async function () {
        // const client = knex.connect();
        await client.from("cabinets").orderBy("id","asc")
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err)=> {
            callback(err, null);
        })
    })();
};

const findForAdmin = function (callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'select ca.*, re.id_company, c.name AS name_company from cabinets ca left outer join relation_comcabi re ON ca.id = re.id_cabinet AND re.ymd_end = "99991231" left outer join companies c ON  re.id_company = c.id ORDER BY ca.id ASC'
        await client.raw(query)
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err)=> {
            callback(err, null);
        })
    })();
};

const findFree = function (callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'SELECT c.id, c.place, c.name FROM cabinets AS c WHERE c.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM nyukyos AS n WHERE n.ymd_end = "99991231" and c.id_nyukyo = n.id ) order by c.id asc';
        await client.raw(query)
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err)=> {
            callback(err, null);
        })
    })();
}

const findByNyukyo = function (id_nyukyo, callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'select * from cabinets where ymd_end = "99991231" and id_nyukyo = ' + tool.returnvalue(id_nyukyo) + ' order by id asc';
        await client.raw(query)
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err)=> {
            callback(err, null);
        });
    })();
};

const insert = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'insert into cabinets values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.place) + ',' + tool.returnvalue(inObj.name) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err)=> {
            callback(err, null);
        });
    })();
};

const update = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'update cabinets set place = ' + tool.returnvalue(inObj.place) + ', name = ' + tool.returnvalue(inObj.name) + ', ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "' + inObj.before_ymd_end + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err)=> {
            callback(err, null);
        });
    })();
};

const remove = function (inObj, callback) {
    (async function () {
        // const client = knex.connect();
        const query = 'delete from cabinets where id = "' + inObj.id + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
        .then((retObj) => {
            callback(null, retObj[0]);
        })
        .catch((err)=> {
            callback(err, null);
        });
    })();
};

module.exports = {
    find,
    findForAdmin,
    findFree,
    findPKey,
    findByNyukyo,
    insert,
    update,
    remove,
};