var connection = require('../db/mysqlconfig');

const findPKey = function (id_company, id_room, callback) {
    (async function () {
        await connection.query('select * from relation_comroom where id_company = "' + id_company + '" and id_room = "' + id_room + '"', function (error, results, fields) {
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
        await connection.query('select b.id as id, b.place as place, b.floor as floor, b.name as name from relation_comroom AS a INNER JOIN rooms AS b ON a.id_room = b.id where a.id_company = "' + id_company + '"', function ( error, results, fields) {
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
        await connection.query('select * from relation_comroom order by id_company asc, id_room asc', function (error, results, fields) {
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
        const query = 'insert into relation_comroom values ("' + inObj.id_company + '","' + inObj.id_room + '", "20200701", "99991231")';
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
        const query = 'update relation_comroom set id_company = "' + inObj.id_company + '", id_room = "' + inObj.id_room + '" where id_company = "' + inObj.id_company + '" and id_room = "' + inObj.id_room + '"';
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
        const query = 'delete from relation_comroom where id_company = "' + id_company+ '" and id_room = "' + id_room + "'";
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
    findByCompany,
    insert,
    update,
    remove,
};