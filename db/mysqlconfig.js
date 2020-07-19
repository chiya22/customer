const mysql = require('mysql');

const dbConfig = {
  host     : 'localhost',
  user     : 'pfs',
  password : 'ps10001sp',
  database : 'pfs',
  port     : 58020,
};

// create table users (
//     id varchar(100) not null primary key,
//     name varchar(100) not null,
//     password varchar(1000) not null,
//     role varchar(100)
//     );
//
// 5f2dffffaa9ad217b9c61cd4976a42d097b4bf52e7c9f8dadc754b6a59ddcc9ee7813283d420dee72bef96b1b3040e01d2715d45a743ccc2b4b34a626ff8033b

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