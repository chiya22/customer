const tool = require('../util/tool');
const knex = require('../db/knex');

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const findPKey = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'select o.*, u1.name as name_add, u2.name as name_upd from (select * from outais where id = "' + inObj.id + '") as o left outer join users u1 on u1.id = o.id_add left outer join users u2 on u2.id = o.id_upd';
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0][0]);
                // callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const find = function (callback) {
    (async function () {
        const client = knex.connect();
        const query = 'select o.*, u1.name as name_add, u2.name as name_upd from ( select * from outais order by ymdhms_add desc) as o left outer join users u1 on u1.id = o.id_add left outer join users u2 on u2.id = o.id_upd';
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0]);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const findByCompany = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'select o.*, u1.name as name_add, u2.name as name_upd from ( select * from outais where id_company = ' + tool.returnvalue(inObj.id_company) + ' order by ymdhms_add desc) as o left outer join users u1 on u1.id = o.id_add left outer join users u2 on u2.id = o.id_upd';
        await client.raw(query)
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
        const client = knex.connect();
        const query = 'select count(*) as count_all from outais where content like "%' + likevalue + '%"';
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj[0].count_all);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const findLikeForPaging = function (likevalue, percount, offset, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'select * from outais where content like "%' + likevalue + '%" limit ' + percount + ' offset ' + offset + ' order by ymdhms_add desc';
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const insert = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'insert into outais values ("' + inObj.id + '",' + tool.returnvalue(inObj.id_company) + ',"' + inObj.content + '",' + tool.returnvalue(inObj.status) + ',"' + inObj.ymdhms_add + '","' + inObj.id_add + '","' + inObj.ymdhms_upd + '","' + inObj.id_upd + '")';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const update = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'update outais set id_company = ' + tool.returnvalue(inObj.id_company) + ', content = "' + inObj.content + '", status = ' + tool.returnvalue(inObj.status) + ', ymdhms_upd = "' + inObj.ymdhms_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id);
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
            .then((retObj) => {
                callback(null, retObj);
            })
            .catch((err) => {
                callback(err, null);
            })
    })();
};

const selectSQL = function (sql, callback) {
    (async function () {
        const client = knex.connect();
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
    findByCompany,
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    selectSQL,
};