var connection = require('../db/mysqlconfig.js');

const findPKey = function (pkey, callback) {
    (async function () {
        await connection.query('select * from companies where id = "' + pkey + '"', function (error, results, fields) {
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
        await connection.query('select * from companies', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const findLikeCount = function (likevalue, callback) {
    (async function () {
        await connection.query('select count(*) as count_all from companies where (name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results[0].count_all);
            };
        });
    })();
};

const findLikeForPaging = function (likevalue, percount, offset, callback) {
    (async function () {
        await connection.query('select * from companies where (name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%") limit ' + percount + ' offset ' + offset, function (error, results, fields) {
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
        const query = 'insert into companies values ("' + inObj.id + '","' + inObj.id_nyukyo + '","' + inObj.id_kaigi + '","' + inObj.name + '","' + inObj.kana + '", "20200701", "99991231", "' + inObj.bikou + '")';
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
        const query = 'update companies set id_nyukyo = "' + inObj.id_nyukyo + '", id_kaigi = "' + inObj.id_kaigi + '", name = "' + inObj.name + '", kana = "' + inObj.kana + '", bikou = "' + inObj.bikou + '" where id = "' + inObj.id + '"';
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
        const query = 'delete from companies where id = "' + pkey + '"';
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
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    remove,
};