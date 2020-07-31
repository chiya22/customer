var connection = require('../db/mysqlconfig');

const findPKey = function (inObj, callback) {
    (async function () {
        await connection.query('select * from relation_comcabi where id_company = "' + inObj.id_company + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' order by id_company asc', function (error, results, fields) {
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
        const query = 'select a.id_company, a.id_cabinet, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.place, b.name from relation_comcabi AS a INNER JOIN cabinets AS b ON a.id_cabinet = b.id where a.id_company = "' + id_company + '" and b.ymd_end = "99991231" order by b.id asc'
        // const query = 'select * from relation_nyucabi AS a INNER JOIN cabinets AS b ON a.id_cabinet = b.id where a.id_nyukyo = "' + id_nyukyo + '" and a.ymd_end = "99991231" and b.ymd_end = "99991231" order by b.id asc'
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
        await connection.query('select * from relation_comcabi where ymd_end = "99991231" order by id_company asc, id_cabinet asc', function (error, results, fields) {
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
        await connection.query('SELECT c.id, c.place, c.name, c.ymd_start, c.ymd_end FROM cabinets AS c WHERE c.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comcabi AS re WHERE c.id = re.id_cabinet and re.ymd_end = "99991231" ) order by c.id asc', function (error, results, fields) {
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
        const query = 'insert into relation_comcabi values ("' + inObj.id_company + '","' + inObj.id_cabinet + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_comcabi AS b WHERE b.id_company = "' + inObj.id_company + '" and b.id_cabinet = "' + inObj.id_cabinet + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
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
        const query = 'update relation_comcabi set id_nyukyo = "' + inObj.id_company + '", id_cabinet = "' + inObj.id_cabinet + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
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
        const query = 'update relation_comcabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
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
        const query = 'update relation_comcabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and ymd_end = "99991231"';
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
    insert,
    update,
    remove,
    cancelByCompany,
};