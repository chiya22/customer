var connection = require('../db/mysqlconfig.js');
const tool = require('../util/tool');

const findPKey = function (inObj, callback) {
    (async function () {
        const query = 'select * from outais where id = "' + inObj.id + '"';
        await connection.query(query, function (error, results, fields) {
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
        await connection.query('select * from outais order by id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const findByCompany = function (inObj, callback) {
    (async function () {
        const query = 'select * from outais where id_company = ' + tool.returnvalue(inObj.id_company) + ' order by ymd_add desc';
        await connection.query(query, function (error, results, fields) {
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
        const query = 'select count(*) as count_all from outais where content like "%' + likevalue + '%"';
        await connection.query(query, function (error, results, fields) {
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
        const query = 'select * from outais where content like "%' + likevalue + '%" limit ' + percount + ' offset ' + offset + ' order by ymd_add desc';
        await connection.query(query, function (error, results, fields) {
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
        const query = 'insert into outais values ("' + inObj.id + '",' + tool.returnvalue(inObj.id_company) + ',"' + inObj.content + '",' + tool.returnvalue(inObj.status) + ',"' + inObj.ymd_add + '","' + inObj.id_add + '","' + inObj.ymd_upd + '","' + inObj.id_upd + '")';
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
        const query = 'update outais set id_company = ' + tool.returnvalue(inObj.id_company) + ', content = "' + inObj.content + '", status = ' + tool.returnvalue(inObj.status) + ', ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id);
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
};