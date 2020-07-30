var connection = require('../db/mysqlconfig.js');
const tool = require('../util/tool');
const { PayloadTooLarge } = require('http-errors');

const findPKey = function (inObj, callback) {
    (async function () {
        const query = 'select * from persons where id = "' + inObj.id + '" and ymd_end = "99991231"';
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
        await connection.query('select * from persons where ymd_end = "99991231" order by id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

// 会社に所属している個人を抽出
const findByCompany = function (inObj, callback) {
    (async function () {
        const query = 'select * from persons where id_company = ' + tool.returnvalue(inObj.id_company) + ' and ymd_end = "99991231" order by ymd_nyukyo asc';
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
        const query = 'select count(*) as count_all from persons where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231"';
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
        const query = 'select * from persons where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231" limit ' + percount + ' offset ' + offset + ' order by id asc';
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
        const query = 'insert into persons values ("' + inObj.id + '",' + tool.returnvalue(inObj.id_company) + ',"' + inObj.kubun_person + '","' + inObj.name + '",' + tool.returnvalue(inObj.kana) + ',' + tool.returnvalue(inObj.telno) + ',' + tool.returnvalue(inObj.telno_mobile) + ',' + tool.returnvalue(inObj.email) + ',' + tool.returnvalue(inObj.no_yubin) + ',' + tool.returnvalue(inObj.todoufuken) + ',' + tool.returnvalue(inObj.address) + ',"' + inObj.ymd_nyukyo + '", "99991231","' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '",' + tool.returnvalue(inObj.bikou) + ')';
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
        const query = 'update persons set id_company = ' + tool.returnvalue(inObj.id_company) + ', kubun_person = "' + inObj.kubun_person + '", name = ' + tool.returnvalue(inObj.name) + ', kana = ' + tool.returnvalue(inObj.kana) + ', telno = ' + tool.returnvalue(inObj.telno) + ', telno_mobile = ' + tool.returnvalue(inObj.telno_mobile) + ', email = ' + tool.returnvalue(inObj.email) + ', no_yubin = ' + tool.returnvalue(inObj.no_yubin) + ', todoufuken = ' + tool.returnvalue(inObj.todoufuken) + ', address = ' + tool.returnvalue(inObj.address) + ', ymd_nyukyo = "' + inObj.ymd_nyukyo + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '", bikou = ' + tool.returnvalue(inObj.bikou) + ' where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "99991231"';
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
    (async function () {
        const query = 'update persons set ymd_kaiyaku = ' + tool.returnvalue(inObj.ymd_kaiyaku) + ', ymd_end = "' + inObj.ymd_end + '" where id = "' + inObj.id + '" and ymd_end = "99991231"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const cancel = function (inObj, callback) {
    (async function () {
        const query = 'update persons set ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = "' + inObj.id + '" and ymd_end = "99991231"';
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
    (async function () {
        const query = 'update persons set ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = ' + tool.returnvalue(inObj.id_company) + ' and ymd_end = "99991231"';
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
    cancel,
    cancelByCompany,
};