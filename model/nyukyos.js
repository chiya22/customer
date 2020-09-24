const knex = require('../db/knex');

const findPKey = function (pkey, callback) {
    (async function () {
        const client = knex.connect();
        await client.from("nyukyos").where({id:pkey})
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
};

const find = function (callback) {
    (async function () {
        const client = knex.connect();
        await client.from("nyukyos").orderBy("id","asc")
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
};

const findForAdmin = function (callback) {
    (async function () {
        const client = knex.connect();
        const query = 'SELECT n.*, c.id as id_company, c.name AS name_company from nyukyos n left outer JOIN companies c ON n.id = c.id_nyukyo AND c.ymd_kaiyaku = "99991231" order by id asc';
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
};

const findForSelect = function (callback) {
    (async function () {
        const client = knex.connect();
        // const query = '(select "【使用中】" AS kubun, nyukyos.id AS id FROM nyukyos WHERE ymd_end = "99991231" and EXISTS (SELECT * FROM companies WHERE companies.ymd_kaiyaku = "99991231" and companies.id_nyukyo = nyukyos.id)) UNION ALL (SELECT "【未使用】" AS kubun, nyukyos.id AS id FROM nyukyos WHERE nyukyos.ymd_end = "99991231" and NOT EXISTS (SELECT * FROM companies WHERE companies.ymd_kaiyaku = "99991231" and companies.id_nyukyo = nyukyos.id)) ORDER BY kubun DESC, id asc';
        const query = 'SELECT n.id AS id, n.ymd_start AS ymd_start, n.ymd_end AS ymd_end, n.ymd_upd AS ymd_upd, n.id_upd AS id_upd, max(c.ymd_kaiyaku) AS ymd_kaiyaku FROM nyukyos AS n LEFT OUTER JOIN companies c ON n.id = c.id_nyukyo AND n.ymd_end = "99991231" AND c.ymd_end = "99991231" GROUP BY n.id ORDER BY ymd_kaiyaku ASC, id asc';
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
};

const insert = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'insert into nyukyos values ("' + inObj.id + '","' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
};

const update = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'update nyukyos set ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = "' + inObj.id + '" and ymd_end = "' + inObj.before_ymd_end + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
};

const remove = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        const query = 'delete from nyukyos where id = "' + inObj.id + '"';
        logger.info('[' + inObj.id_upd + ']' + query);
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
};

module.exports = {
    find,
    findPKey,
    findForAdmin,
    findForSelect,
    insert,
    update,
    remove,
};