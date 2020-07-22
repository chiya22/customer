var connection = require('../db/mysqlconfig');

const findPKey = function (id_company, id_room, callback) {
    (async function () {
        await connection.query('select * from relation_comroom where id_company = "' + id_company + '" and id_room = "' + id_room + '" and ymd_end = "99991231" order by id_company asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results[0]);
            }
        });
    })();
};

const findByCompany = function (id_company, callback) {
    (async function () {
        await connection.query('select b.id as id, b.place as place, b.floor as floor, b.name as name from relation_comroom AS a INNER JOIN rooms AS b ON a.id_room = b.id where a.id_company = "' + id_company + '" and a.ymd_end = "99991231" and b.ymd_end = "99991231" order by b.id asc', function ( error, results, fields) {
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
        await connection.query('select * from relation_comroom where ymd_end = "99991231" order by id_company asc, id_room asc', function (error, results, fields) {
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
        await connection.query('SELECT r.id, r.place, r.floor, r.name FROM rooms AS r WHERE r.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comroom AS re WHERE r.id = re.id_room and re.ymd_end = "99991231" ) order by r.id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
}

const findForSelect = function (callback) {
    (async function () {
        await connection.query('(SELECT "【未使用】" as kubun, r.id, r.place, r.floor, r.name FROM rooms AS r WHERE r.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comroom AS re WHERE r.id = re.id_room and re.ymd_end = "99991231" )) UNION ALL (SELECT "【使用中】" as kubun, r.id, r.place, r.floor, r.name FROM rooms AS r WHERE r.ymd_end = "99991231" and EXISTS ( SELECT * FROM relation_comroom AS re WHERE r.id = re.id_room and re.ymd_end = "99991231" ))', function (error, results, fields) {
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
        const query = 'insert into relation_comroom values ("' + inObj.id_company + '","' + inObj.id_room + '", "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
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
        const query = 'update relation_comroom set id_company = "' + inObj.id_company + '", id_room = "' + inObj.id_room + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_room = "' + inObj.id_room + '" and ymd_end = "99991231"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const remove = function (id_company, id_room, callback) {
    (async function() {
        const query = 'delete from relation_comroom where id_company = "' + id_company+ '" and id_room = "' + id_room + '" and ymd_end = "99991231"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const cancelByCompany = function (inObj, callback) {
    (async function() {
        const query = 'update relation_comroom set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and ymd_end = "99991231"';
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
    findByCompany,
    findForSelect,
    insert,
    update,
    remove,
    cancelByCompany,
};