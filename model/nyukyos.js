var connection = require('../db/mysqlconfig.js');

const findPKey = function (pkey, callback) {
    (async function () {
        await connection.query('select * from nyukyos where id = "' + pkey + '"', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results[0]);
            }
        });
    })();
};

const find = function (callback) {
    (async function () {
        await connection.query('select * from nyukyos order by id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const findForSelect = function (callback) {
    (async function () {
        await connection.query('(select "" AS kubun, nyukyos.id AS id FROM nyukyos WHERE EXISTS (SELECT * FROM companies WHERE companies.id_nyukyo = nyukyos.id)) UNION ALL (SELECT "【未使用】" AS kubun, nyukyos.id AS id FROM nyukyos WHERE NOT EXISTS (SELECT * FROM companies WHERE companies.id_nyukyo = nyukyos.id)) ORDER BY kubun DESC, id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const insert = function (inObj, callback) {
    (async function () {
        const query = 'insert into nyukyos values ("' + inObj.id + '","20200701", "99991231")';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const update = function (inObj, callback) {
    (async function () {
        const query = 'update nyukyos set ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '" where id = "' + inObj.id + '"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const remove = function (pkey, callback) {
    (async function () {
        const query = 'delete from nyukyos where id = "' + pkey + '"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

module.exports = {
    find,
    findPKey,
    findForSelect,
    insert,
    update,
    remove,
};