import {asyncMysqlQuery} from "./util.js";

const COLUMN_DATA_TYPE = {
    "int": "INT",
    "decimal": "DECIMAL",
    "string": "VARCHAR(100)"
};

export async function create(templateJson) {
    const template = await asyncMysqlQuery(`
        INSERT INTO template (templateName) VALUES ('${templateJson.name}');
    `);
    const templateId = template.insertId;
    console.log('[] -- Created template ', template);

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
}

function _getSqlColumn(column) {
    const {name, type, value, key, index} = column;
    let defaultValueConstraint = "";
    if (value && [undefined, null, NaN].indexOf(value) < 0) {
        defaultValueConstraint = `DEFAULT '${value}'`;
    }

    return `${name} ${COLUMN_DATA_TYPE[type]} ${defaultValueConstraint}`;
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
    `;
}
