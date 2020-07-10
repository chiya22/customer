var connection = require('../db/mysqlconfig.js');

const findPKey = function (pkey, callback) {
    (async function () {
        await connection.query('select * from persons where id = "' + pkey + '"', function (error, results, fields) {
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
        await connection.query('select * from persons', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const findByCompany = function (id_company, callback) {
    (async function () {
        await connection.query('select * from persons where id_company = "' + id_company + '"', function (error, results, fields) {
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
        await connection.query('select count(*) as count_all from persons where (name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")', function (error, results, fields) {
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
        await connection.query('select * from persons where (name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%") limit ' + percount + ' offset ' + offset, function (error, results, fields) {
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
        const query = 'insert into persons values ("' + inObj.id + '","' + inObj.id_company + '","' + inObj.name + '","' + inObj.kana + '", "' + inObj.telno + '", "' + inObj.telno_mobile + '", "' + inObj.email + '", "' + inObj.no_yubin + '", "' + inObj.todoufuken + '", "' + inObj.address + '", "20200701", "99991231", "' + inObj.bikou + '")';
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
        const query = 'update persons set id_company = "' + inObj.id_company + '", name = "' + inObj.name + '", kana = "' + inObj.kana + '", telno = "' + inObj.telno + '", telno_mobile = "' + inObj.telno_mobile + '", email = "' + inObj.email + '", no_yubin = "' + inObj.no_yubin + '", todoufuken = "' + inObj.todoufuken + '", address = "' + inObj.address + '", bikou = "' + inObj.bikou + '" where id = "' + inObj.id + '"';
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
        const query = 'delete from persons where id = "' + pkey + '"';
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
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    remove,
};