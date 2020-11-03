import mysql from "mysql";

function getConnection() {
    const connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '123456',
        database: 'data_entry_template_manage'
    });

    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('connected as id ' + connection.threadId);
    });

    return connection;
}

export function asyncMysqlQuery(sql) {

    console.log("######## asyncMysqlQuery ######### \n", sql);

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
    console.log('[] -- Dropped table "templateDataModel"');

    await asyncMysqlQuery(`DROP TABLE templateInstance;`);
    console.log('[] -- Dropped table "templateInstance"');

    await asyncMysqlQuery(`DROP TABLE template;`);
    console.log('[] -- Dropped table "template"');
}

export async function initTables() {
    await asyncMysqlQuery(`
        CREATE TABLE template (
            templateId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            templateName VARCHAR(30) NOT NULL
        );
    `);
    console.log('[] -- Created table "template"');

    await asyncMysqlQuery(`
        CREATE TABLE templateInstance (
            templateInstanceId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            templateId INT(6) UNSIGNED  NOT NULL,
            FOREIGN KEY (templateId) REFERENCES template(templateId)
        );
    `);
    console.log('[] -- Created table "templateInstance"');

    await asyncMysqlQuery(`
        CREATE TABLE templateDataModel (
            templateDataModelId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            templateId INT(6) UNSIGNED  NOT NULL,
            dataModelName VARCHAR(30) NOT NULL,
            UNIQUE (templateId, dataModelName),
            FOREIGN KEY (templateId) REFERENCES template(templateId)
        );
    `);
    console.log('[] -- Created table "templateDataModel"');
}


