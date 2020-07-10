var connection = require('../db/mysqlconfig.js');

const findPKey = function (pkey, callback) {
    (async function () {
        await connection.query('select * from rooms where id = "' + pkey + '"', function (error, results, fields) {
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
        await connection.query('select * from rooms order by place asc, floor asc', function (error, results, fields) {
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
        const query = 'insert into rooms values ("' + inObj.id + '","' + inObj.place + '","' + inObj.floor + '","' + inObj.name + '", "20200701", "99991231")';
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
        const query = 'update rooms set place = "' + inObj.place + '", floor = "' + inObj.floor + '", name = "' + inObj.name + '" where id = "' + inObj.id + '"';
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
        const query = 'delete from rooms where id = "' + pkey + '"';
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
    insert,
    update,
    remove,
};