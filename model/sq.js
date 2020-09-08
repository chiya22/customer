const knex = require("../db/knex.js");

const getSqCompany = function (callback) {
    (async function () {

        const query1 = 'update sq_company set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_company';

        const client = knex.connect();
        const retObj1 = await client.raw(query1);
        const retObj2 = await client.raw(query2);

        callback(null, retObj2[0][0]);

    })();
};

const getSqPerson = function (callback) {
    (async function () {
        const query1 = 'update sq_person set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_person';
        const client = knex.connect();
        const retObj1 = await client.raw(query1);
        const retObj2 = await client.raw(query2);

        callback(null, retObj2[0][0]);
    })();
};

const getSqOutai = function (callback) {
    (async function () {
        const query1 = 'update sq_outai set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_outai';
        const client = knex.connect();
        const retObj1 = await client.raw(query1);
        const retObj2 = await client.raw(query2);

        callback(null, retObj2[0][0]);
    })();
};

module.exports = {
    getSqCompany,
    getSqPerson,
    getSqOutai,
};
