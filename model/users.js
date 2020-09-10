const knex = require("../db/knex.js");
// ■ find
const find = ((username, callback) => {
    (async function () {
        const client = knex.connect();
        await client.from("users").where({
            id: username,
            ymd_end: "99991231",
        })
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        });
    })();
});

module.exports = {
    find: find,
};