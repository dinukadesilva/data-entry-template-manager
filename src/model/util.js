import mysql from "mysql";
import logger from "../logger.js";

function getConnection() {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    connection.connect(function (err) {
        if (err) {
            logger.error('error connecting: ' + err.stack);
            return;
        }

        logger.log('connected as id ' + connection.threadId);
    });

    return connection;
}

export function asyncMysqlQuery(sql) {

    logger.log("######## asyncMysqlQuery ######### \n", sql);

    return new Promise((resolve, reject) => {
        const connection = getConnection();
        connection.query(sql, function (error, results) {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
        connection.end();
    })
}

