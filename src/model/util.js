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

export async function dropTables() {
    await asyncMysqlQuery(`DROP TABLE templateDataModel;`);
    logger.log('[] -- Dropped table "templateDataModel"');

    await asyncMysqlQuery(`DROP TABLE templateInstance;`);
    logger.log('[] -- Dropped table "templateInstance"');

    await asyncMysqlQuery(`DROP TABLE template;`);
    logger.log('[] -- Dropped table "template"');
}

export async function initTables() {
    await asyncMysqlQuery(`
        CREATE TABLE template (
            templateId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            templateName VARCHAR(30) NOT NULL
        );
    `);
    logger.log('[] -- Created table "template"');

    await asyncMysqlQuery(`
        CREATE TABLE templateInstance (
            templateInstanceId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            templateId INT(6) UNSIGNED  NOT NULL,
            FOREIGN KEY (templateId) REFERENCES template(templateId)
        );
    `);
    logger.log('[] -- Created table "templateInstance"');

    await asyncMysqlQuery(`
        CREATE TABLE templateDataModel (
            templateDataModelId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            templateId INT(6) UNSIGNED  NOT NULL,
            dataModelName VARCHAR(30) NOT NULL,
            UNIQUE (templateId, dataModelName),
            FOREIGN KEY (templateId) REFERENCES template(templateId)
        );
    `);
    logger.log('[] -- Created table "templateDataModel"');
}

