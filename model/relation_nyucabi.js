var connection = require('../db/mysqlconfig');

const findPKey = function (id_nyukyo, id_cabinet, callback) {
    (async function () {
        await connection.query('select * from relation_nyucabi where id_nyukyo = "' + id_nyukyo + '" and id_cabinet = "' + id_cabinet + '"', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results[0]);
            }
        });
    })();
};

const findByNyukyo = function (id_nyukyo, callback) {
    (async function () {
        await connection.query('select b.id as id, b.place as place, b.name as name, b.ymd_start as ymd_start, b.ymd_end as ymd_end from relation_nyucabi AS a INNER JOIN cabinets AS b ON a.id_cabinet = b.id where a.id_nyukyo = "' + id_nyukyo + '"', function ( error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const find = function (callback) {
    (async function () {
        await connection.query('select * from relation_nyucabi order by id_nyukyo asc, id_cabinet asc', function (error, results, fields) {
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
        await connection.query('SELECT c.id, c.place, c.name, c.ymd_start, c.ymd_end FROM cabinets AS c WHERE NOT EXISTS ( SELECT * FROM relation_nyucabi AS re WHERE c.id = re.id_cabinet )', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
}


const insert = function (inObj, callback) {
    (async function() {
        const query = 'insert into relation_nyucabi values ("' + inObj.id_nyukyo + '","' + inObj.id_cabinet + '", "20200701", "99991231")';
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
        const query = 'update relation_nyucabi set id_nyukyo = "' + inObj.id_nyukyo + '", id_cabinet = "' + inObj.id_cabinet + '" where id_nyukyo = "' + inObj.id_nyukyo + '" and id_cabinet = "' + inObj.id_cabinet + '"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const remove = function (id_nyukyo, id_cabinet, callback) {
    (async function() {
        const query = 'delete from relation_nyucabi where id_nyukyo = "' + id_nyukyo+ '" and id_cabinet = "' + id_cabinet + '"';
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