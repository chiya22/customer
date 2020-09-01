var connection = require('../db/mysqlconfig');

const findPKey = function (inObj, callback) {
    (async function () {
        await connection.query('select * from relation_combicycle where id_company = "' + inObj.id_company + '" and id_bicycle = "' + inObj.id_bicycle + '" and no_seq = ' + inObj.no_seq, function (error, results, fields) {
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
        const query ='select a.id_company, a.id_bicycle, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.id, b.name, b.ymd_start as bicycle_ymd_start, b.ymd_end as bicycle_ymd_end, b.ymd_upd as bicycle_ymd_upd, b.id_upd as bicycle_id_upd from relation_combicycle AS a INNER JOIN bicycles AS b ON a.id_bicycle = b.id where a.id_company = "' + id_company + '" and b.ymd_end = "99991231" order by b.id asc';
        // const query ='select * from relation_comroom AS a INNER JOIN rooms AS b ON a.id_room = b.id where a.id_company = "' + id_company + '" and a.ymd_end = "99991231" and b.ymd_end = "99991231" order by b.id asc';
        await connection.query(query, function ( error, results, fields) {
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
        await connection.query('select * from relation_combicycle where ymd_end = "99991231" order by id_company asc', function (error, results, fields) {
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
        const query = 'SELECT b.id, b.name, b.ymd_start, b.ymd_end, b.ymd_upd, b.id_upd FROM bicycles AS b WHERE b.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_combicycle AS re WHERE b.id = re.id_bicycle and re.ymd_end = "99991231" )'
        await connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
}

// const findForSelect = function (callback) {
//     (async function () {
//         await connection.query('(SELECT "【未使用】" as kubun, r.id, r.place, r.floor, r.person, r.name FROM rooms AS r WHERE r.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comroom AS re WHERE r.id = re.id_room and re.ymd_end = "99991231" )) UNION ALL (SELECT "【使用中】" as kubun, r.id, r.place, r.floor, r.person, r.name FROM rooms AS r WHERE r.ymd_end = "99991231" and EXISTS ( SELECT * FROM relation_comroom AS re WHERE r.id = re.id_room and re.ymd_end = "99991231" ))', function (error, results, fields) {
//             if (error) {
//                 callback(error, null);
//             } else {
//                 callback(null, results);
//             }
//         });
//     })();
// }


const insert = function (inObj, callback) {
    (async function() {
        const query = 'insert into relation_combicycle values ("' + inObj.id_company + '","' + inObj.id_bicycle + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_combicycle AS b WHERE b.id_company = "' + inObj.id_company + '" AND b.id_bicycle = "' + inObj.id_bicycle + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
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
        const query = 'update relation_combicycle set id_company = "' + inObj.id_company + '", id_bicycle = "' + inObj.id_bicycle + ', ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_bicycle = "' + inObj.id_bicycle + '" and ymd_end = "99991231"';
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
        const query = 'update relation_combicycle set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company+ '" and id_bicycle = "' + inObj.id_bicycle + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
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
        const query = 'update relation_combicycle set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and ymd_end = "99991231"';
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
    // findForSelect,
    insert,
    update,
    remove,
    cancelByCompany,
};