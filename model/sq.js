const knex = require('../db/knex.js').connect();

const getSqCompany = async () => {
    try {
        const query1 = 'update sq_company set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_company';

        // const client = knex.connect();
        const retObj1 = await knex.raw(query1);
        const retObj2 = await knex.raw(query2);

        return retObj2[0][0];
    } catch(err) {
        throw err;
    }
};

const getSqPerson = async () => {
    try {
        const query1 = 'update sq_person set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_person';
        // const client = knex.connect();
        const retObj1 = await knex.raw(query1);
        const retObj2 = await knex.raw(query2);

        return retObj2[0][0];
    } catch(err) {
        throw err;
    }
};

const getSqOutai = async () => {
    try {
        const query1 = 'update sq_outai set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_outai';
        // const client = knex.connect();
        const retObj1 = await knex.raw(query1);
        const retObj2 = await knex.raw(query2);

        return retObj2[0][0];
    } catch(err) {
        throw err;
    }
};

const getSqOutaikaigi = async () => {
    try {
        const query1 = 'update sq_outai_kaigi set id=LAST_INSERT_ID(id+1)';
        const query2 = 'select LAST_INSERT_ID() as no from sq_outai_kaigi';
        // const client = knex.connect();
        const retObj1 = await knex.raw(query1);
        const retObj2 = await knex.raw(query2);

        return retObj2[0][0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    getSqCompany,
    getSqPerson,
    getSqOutai,
    getSqOutaikaigi,
};
