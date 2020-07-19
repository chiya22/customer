var connection = require('../db/mysqlconfig.js');
const tool = require('../util/tool');

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

const findFree = function (callback) {
    (async function () {
        await connection.query('SELECT c.id, c.place, c.name FROM cabinets AS c WHERE NOT EXISTS ( SELECT * FROM nyukyos AS n WHERE c.id_nyukyo = n.id )', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
}

const findByNyukyo = function (id_nyukyo, callback) {
    (async function () {
        await connection.query('select * from cabinets where id_nyukyo = ' + tool.returnvalue(id_nyukyo) + ' order by id asc', function (error, results, fields) {
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
        const query = 'insert into cabinets values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.id_nyukyo) + ',' + tool.returnvalue(inObj.place) + ',' + tool.returnvalue(inObj.name) + ', "20200701", "99991231")';
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
        const query = 'update cabinets set id_nyukyo = ' + tool.returnvalue(inObj.id_nyukyo)  + ', place = ' + tool.returnvalue(inObj.place) + ', name = ' + tool.returnvalue(inObj.name) + ' where id = ' + tool.returnvalue(inObj.id);
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
    findFree,
    findPKey,
    findByNyukyo,
    insert,
    update,
    remove,
};