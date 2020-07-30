var connection = require('../db/mysqlconfig');

const findPKey = function (inObj, callback) {
    (async function () {
        await connection.query('select * from relation_nyucabi where id_nyukyo = "' + inObj.id_nyukyo + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231" order by id_nyukyo asc', function (error, results, fields) {
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
        await connection.query('select * from relation_nyucabi AS a INNER JOIN cabinets AS b ON a.id_cabinet = b.id where a.id_nyukyo = "' + id_nyukyo + '" and a.ymd_end = "99991231" and b.ymd_end = "99991231" order by b.id asc', function ( error, results, fields) {
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
        await connection.query('select * from relation_nyucabi where ymd_end = "99991231" order by id_nyukyo asc, id_cabinet asc', function (error, results, fields) {
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
        await connection.query('SELECT c.id, c.place, c.name, c.ymd_start, c.ymd_end FROM cabinets AS c WHERE c.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_nyucabi AS re WHERE c.id = re.id_cabinet and re.ymd_end = "99991231" ) order by c.id asc', function (error, results, fields) {
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
        const query = 'insert into relation_nyucabi values ("' + inObj.id_nyukyo + '","' + inObj.id_cabinet + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_nyucabi AS b WHERE b.id_nyukyo = "' + inObj.id_nyukyo + '" and b.id_cabinet = "' + inObj.id_cabinet + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
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
        const query = 'update relation_nyucabi set id_nyukyo = "' + inObj.id_nyukyo + '", id_cabinet = "' + inObj.id_cabinet + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_nyukyo = "' + inObj.id_nyukyo + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const remove = function (inObj, callback) {
    (async function() {
        const query = 'update relation_nyucabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_nyukyo = "' + inObj.id_nyukyo+ '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const cancelByNyukyo = function (inObj, callback) {
    (async function() {
        const query = 'update relation_nyucabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_nyukyo = "' + inObj.id_nyukyo + '" and ymd_end = "99991231"';
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
    cancelByNyukyo,
};