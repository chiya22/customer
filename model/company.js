var connection = require('../db/mysqlconfig.js');
const tool = require('../util/tool');

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

const findForSelect = function (callback) {
    (async function () {
        await connection.query('select companies.id, companies.name from companies order by companies.id asc ', function (error, results, fields) {
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
        await connection.query('select * from companies where id_nyukyo = "' + id_nyukyo + '" order by id asc', function (error, results, fields) {
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
    (async function () {
        const query = 'insert into companies values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.id_nyukyo) + ',' + tool.returnvalue(inObj.id_kaigi) + ',' + tool.returnvalue(inObj.name) + ',' + tool.returnvalue(inObj.kana) + ', "20200701", "99991231", ' + tool.returnvalue(inObj.bikou) + ')';
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
        const query = 'update companies set id_nyukyo = ' + tool.returnvalue(inObj.id_nyukyo) + ', id_kaigi = ' + tool.returnvalue(inObj.id_kaigi) + ', name = ' + tool.returnvalue(inObj.name) + ', kana = ' + tool.returnvalue(inObj.kana) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ' where id = ' + tool.returnvalue(inObj.id);
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
    (async function () {
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
    findForSelect,
    findByNyukyo,
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    remove,
};