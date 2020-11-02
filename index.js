const express = require('express')
var mysql = require('mysql');
const app = express();
const port = 3005;

function getConnection() {
    var connection = mysql.createConnection({
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

function asyncMysqlQuery(sql) {
    console.log("#################################\n", sql)
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

app.get('/dropTables', async (req, res) => {
    await asyncMysqlQuery(`DROP TABLE templateDataModel;`);
    console.log('[] -- Dropped table "templateDataModel"');

    await asyncMysqlQuery(`DROP TABLE template;`);
    console.log('[] -- Dropped table "template"');

    res.send('Hello World!')
});

app.get('/createTables', async (req, res) => {
    await asyncMysqlQuery(`
        CREATE TABLE template (
            templateId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            templateName VARCHAR(30) NOT NULL
        );
    `);
    console.log('[] -- Created table "template"');


    await asyncMysqlQuery(`
        CREATE TABLE templateDataModel (
            templateId INT(6) UNSIGNED  NOT NULL,
            dataModelName VARCHAR(30) NOT NULL,
            PRIMARY KEY (templateId, dataModelName),
            FOREIGN KEY (templateId) REFERENCES template(templateId)
        );
    `);
    console.log('[] -- Created table "templateDataModel"');

    res.send('Hello World!')
});

const COLUMN_DATA_TYPE = {
    "int": "INT",
    "decimal": "DECIMAL",
    "string": "VARCHAR(100)"
}

app.get('/template', async (req, res) => {
    const templateJson = {
        name: "template 1",
        columns: [
            {name: "countryId", type: "int", index: true, key: true},
            {name: "electoralDistrictId", type: "int", index: true, key: true},
            {name: "pollingDivisionId", type: "int", index: true, key: true},
            {name: "countingCentreId", type: "int", index: true, key: true},
            {name: "rejectedVoteCount", type: "decimal", value: 0, index: false, key: false},
            {name: "rejectedVoteCountInWords", type: "string", value: "", index: false, key: false}
        ],
        dataModels: [
            {
                name: "Party wise vote counts",
                columns: [
                    {name: "partyId", type: "int", index: true, key: true},
                    {name: "partyName", type: "string", value: "", index: false, key: false},
                    {name: "voteCount", type: "decimal", value: 0, index: false, key: false},
                    {name: "voteCountInWords", type: "string", value: "", index: false, key: false}
                ]
            }
        ]
    };

    const template = await asyncMysqlQuery(`
        INSERT INTO template (templateName) VALUES ('${templateJson.name}');
    `);
    const templateId = template.insertId;
    console.log('[] -- Created template ', template);

    function _getSqlColumn(column) {
        const {name, type, value, key, index} = column;
        let defaultValueConstraint = "";
        if (value && [undefined, null, NaN].indexOf(value) < 0) {
            defaultValueConstraint = `DEFAULT '${value}'`;
        }

        return `${name} ${COLUMN_DATA_TYPE[type]} `;
    }

    function _getSqlTable(tableName, columns) {
        let sqlColumns = "";
        let primaryColumns = "";
        let indexColumns = "";

        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            const {name, key, index} = column;

            if (sqlColumns === "") {
                sqlColumns += _getSqlColumn(column);
            } else {
                sqlColumns += `, ${_getSqlColumn(column)}`;
            }

            if (key) {
                if (primaryColumns === "") {
                    primaryColumns += name;
                } else {
                    primaryColumns += `, ${name}`;
                }
            }

            if (index) {
                if (indexColumns === "") {
                    indexColumns += name;
                } else {
                    indexColumns += `, ${name}`;
                }
            }
        }

        return `
            CREATE TABLE ${tableName} (
                ${sqlColumns},
                PRIMARY KEY (${primaryColumns}),
                INDEX (${indexColumns})
            );
        `

    }

    await asyncMysqlQuery(_getSqlTable(`template_${templateId}`, templateJson.columns));

    templateJson.dataModels.map(async (dataModel) => {
        const {name, columns} = dataModel;
        await asyncMysqlQuery(`
            INSERT INTO templateDataModel (templateId, dataModelName) VALUES ('${templateId}', '${name}');
        `);
        const templateDataModelTableNameSuffix = name.replace(/ /g, "_").toLowerCase();

        await asyncMysqlQuery(_getSqlTable(
            `templateDataModel_${templateId}_${templateDataModelTableNameSuffix}`, dataModel.columns
        ));
    });

    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
