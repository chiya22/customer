var connection = require('../db/mysqlconfig.js');
const tool = require('../util/tool');

const findPKey = function (inObj, callback) {
    (async function () {
        const query = 'select * from companies where id = "' + inObj.id + '" and ymd_end = "99991231"';
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
        await connection.query('select * from companies where ymd_end = "99991231" order by id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const findForSelect = function (callback) {
    (async function () {
        await connection.query('select id, kubun_company, name, ymd_nyukyo, ymd_kaiyaku from companies where ymd_end = "99991231" order by id asc ', function (error, results, fields) {
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
        const query = 'select * from companies where id_nyukyo = "' + id_nyukyo + '" and ymd_end = "99991231" order by ymd_kaiyaku asc';
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
        await connection.query('select count(*) as count_all from companies where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231"', function (error, results, fields) {
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
        await connection.query('select * from companies where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231" limit ' + percount + ' offset ' + offset + ' order by id asc', function (error, results, fields) {
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
        const query = 'insert into companies values ("' + inObj.id + '",' + tool.returnvalue(inObj.id_nyukyo) + ',' + tool.returnvalue(inObj.id_kaigi) + ',"' + inObj.kubun_company + '","' + inObj.name + '",' + tool.returnvalue(inObj.kana) + ',"' + inObj.ymd_nyukyo + '","99991231","' + inObj.ymd_start + '","99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '", ' + tool.returnvalue(inObj.bikou) + ')';
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
        const query = 'update companies set kubun_company = ' + tool.returnvalue(inObj.kubun_company) + ', id_nyukyo = ' + tool.returnvalue(inObj.id_nyukyo) + ', id_kaigi = ' + tool.returnvalue(inObj.id_kaigi) + ', name = ' + tool.returnvalue(inObj.name) + ', kana = ' + tool.returnvalue(inObj.kana) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ', ymd_nyukyo = "' + inObj.ymd_nyukyo + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = "' + inObj.id + '" and ymd_end = "99991231"';
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
        const query = 'update companies set ymd_end = "' + inObj.ymd_end + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '" where id = "' + inObj.id + '" and ymd_end ="99991231"';
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
        const query = 'update companies set ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "99991231"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
}

module.exports = {
    find,
    findPKey,
    findForSelect,
    findByNyukyo,
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    remove,
    cancel,
};