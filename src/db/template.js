import {asyncMysqlQuery} from "./util.js";

const COLUMN_DATA_TYPE = {
    "int": "INT",
    "decimal": "DECIMAL",
    "varchar": "VARCHAR(100)"
};

export async function createTemplate(templateJson) {
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

export async function getTemplate(templateId) {
    let template = await asyncMysqlQuery(`SELECT * FROM template WHERE templateId = ${templateId}`);
    if (template.length > 0) {
        template = template[0];
        template.columns = [];
        const templateColumns = await asyncMysqlQuery(`
            SELECT COLUMN_NAME,COLUMN_DEFAULT, DATA_TYPE, COLUMN_KEY 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'data_entry_template_manage' AND TABLE_NAME = 'template_${template.templateId}'
        `);

        for (let i = 0; i < template.columns.length; i++) {
            const {COLUMN_NAME, COLUMN_DEFAULT, DATA_TYPE, COLUMN_KEY} = templateColumns[i];
            if (["templateId", "templateInstanceId"].indexOf(COLUMN_NAME) < 0) {
                template.columns.push({
                    name: COLUMN_NAME,
                    type: DATA_TYPE,
                    value: COLUMN_DEFAULT,
                    key: COLUMN_KEY === "PRI"
                });
            }
        }
    } else {
        template = null;
    }

    return template;
}

function _getSqlColumn(column) {
    const {name, type, value, key} = column;
    let defaultValueConstraint = "";
    if (value && [undefined, null, NaN].indexOf(value) < 0) {
        defaultValueConstraint = `DEFAULT '${value}'`;
    }

    return `${name} ${COLUMN_DATA_TYPE[type]} ${defaultValueConstraint}`;
}

function _getSqlTable(tableName, columns) {
    let sqlColumns = "";
    let primaryColumns = "";

    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const {name, key} = column;

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
    }

    return `
        CREATE TABLE ${tableName} (
            templateId INT(6) UNSIGNED  NOT NULL,
            templateInstanceId INT(6) UNSIGNED  NOT NULL,
            ${sqlColumns},
            PRIMARY KEY (templateId, templateInstanceId, ${primaryColumns}),
            FOREIGN KEY (templateId) REFERENCES template(templateId),
            FOREIGN KEY (templateInstanceId) REFERENCES templateInstance(templateInstanceId)
        );
    `;
}
