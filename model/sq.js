const connection = require('../db/mysqlconfig.js');
const knex = require("../db/knex.js");

const getSqCompany = function (callback) {
    (async function () {
        const query1 = 'update sq_company set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_company';
        connection.query(query1, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                connection.query(query2, function (error, results, fields) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, results[0]);
                    }
                });
            }
        });
    })();
};

const getSqPerson = function (callback) {
    (async function () {
        const query1 = 'update sq_person set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_person';
        connection.query(query1, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                connection.query(query2, function (error, results, fields) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, results[0]);
                    }
                });
            }
        });
    })();
};

const getSqOutai = function (callback) {
    (async function () {
        const query1 = 'update sq_outai set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_outai';
        connection.query(query1, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                connection.query(query2, function (error, results, fields) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, results[0]);
                    }
                });
            }
        });
    })();
};

module.exports = {
    getSqCompany,
    getSqPerson,
    getSqOutai,
};
