const knex = require("../db/knex.js");

const getUserPK = async (knex, pk_value) => {
    return await knex("users")
        .where({
            id: pk_value,
            ymd_end: '99991231',
        });
};

// ■ find
const find = ((username, callback) => {
    (async function () {
        const client = knex.connect();
        let user = await getUserPK(client, username);
        callback(null, user);
    })();
});

module.exports = {
    find: find,
};