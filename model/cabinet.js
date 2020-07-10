var connection = require('../db/mysqlconfig.js');

const findPKey = function (pkey, callback) {
    (async function () {
        await connection.query('select * from cabinets where id = "' + pkey + '"', function (error, results, fields) {
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
        await connection.query('select * from cabinets', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const findByNyukyo = function (id_nyukyo, callback) {
    (async function () {
        await connection.query('select * from cabinets where id_nyukyo = "' + id_nyukyo + '" order by id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const insert = function (inObj, callback) {
    (async function() {
        const query = 'insert into cabinets values ("' + inObj.id + '","' + inObj.id_nyukyo + '","' + inObj.place + '","' + inObj.name + '", "20200701", "99991231")';
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
    (async function() {
        const query = 'update cabinets set id_nyukyo = "' + inObj.id_nyukyo + '", place = "' + inObj.place + '", name = "' + inObj.name + '" where id = "' + inObj.id + '"';
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
    (async function() {
        const query = 'delete from cabinets where id = "' + pkey + '"';
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
    findByNyukyo,
    insert,
    update,
    remove,
};