const mysql = require('mysql');

const dbConfig = {
  host     : 'localhost',
  user     : 'pfs',
  password : 'ps10001sp',
  database : 'pfs'
};

// create table users (
//     id varchar(100) not null,
//     name varchar(100) not null,
//     password varchar(100) not null,
//     role varchar(100)
// );

let connection;

function handleDisconnect() {
    console.log('create mysql connection');
    connection = mysql.createConnection(dbConfig);

    connection.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    //error時の処理
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });

    module.exports = connection;
}

handleDisconnect();