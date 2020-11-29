import {asyncMysqlQuery} from "./util.js";
import logger from "../logger.js";

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
    logger.log('[] -- Created template ', template);

    async function createTablesForJson(name, dataModel) {


        const templateDataModel = await asyncMysqlQuery(`
            INSERT INTO templateDataModel (templateId, dataModelName) VALUES ('${templateId}', '${name}');
        `);
        const templateDataModelId = templateDataModel.insertId;

        const dataModelColumns = [];
        for (let columnName in dataModel) {
            const dataItem = dataModel[columnName];

            // Filter the column type data and exclude the data models.
            if (dataItem.type && typeof dataItem.type === "string") {
                dataItem.name = columnName;
                dataModelColumns.push(dataItem);
            } else {

                // Restrict the json properties not to have empty names since empty name is given for the root data model.
                if (columnName === "") {
                    throw new Error("Template json property name shouldn't be empty.");
                }

                // Data model name should not have stops (.) since stops are used for internally maintaining the hierarchy.
                if (/\./g.exec(columnName)) {
                    throw new Error("Template json property name should not have any stops (.)");
                }

                // Append the suffix only if there's a non empty suffix.
                if (name !== "") {
                    columnName = `${name}.${columnName}`;
                }

                await createTablesForJson(columnName, dataItem);
            }
        }

        await createTable(`template_${templateId}_dataModel_${templateDataModelId}`, dataModelColumns);
    }

    await createTablesForJson("", templateJson.data);

    return {templateId};
}

export async function getTemplate(templateId) {
    let template = await asyncMysqlQuery(`SELECT * FROM template WHERE templateId = ${templateId}`);
    if (template.length > 0) {
        template = template[0];

        const dataModels = await asyncMysqlQuery(`SELECT * FROM templateDataModel WHERE templateId = ${templateId}`);

        for (let j = 0; j < dataModels.length; j++) {
            const dataModel = dataModels[j];
            const {templateDataModelId, dataModelName} = dataModel;
            const templateDataModelColumns = await asyncMysqlQuery(`
                SELECT COLUMN_NAME, COLUMN_DEFAULT, DATA_TYPE, COLUMN_KEY
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
                    AND TABLE_NAME = 'template_${template.templateId}_dataModel_${templateDataModelId}'
            `);

            const dataModelPaths = dataModelName.split(".");
            let dataModelReference = template;
            for (let k = 0; k < dataModelPaths.length; k++) {
                const dataModelPath = dataModelPaths[k];
                if (dataModelPath !== "") {
                    if (!dataModelReference[dataModelPath]) {
                        dataModelReference[dataModelPath] = {};
                    }

                    dataModelReference = dataModelReference[dataModelPath];
                }
            }

            for (let j = 0; j < templateDataModelColumns.length; j++) {
                let {COLUMN_NAME, COLUMN_DEFAULT, DATA_TYPE, COLUMN_KEY} = templateDataModelColumns[j];
                if (["templateId", "templateInstanceId", "templateRowId"].indexOf(COLUMN_NAME) < 0) {

                    // https://jira.mariadb.org/browse/MDEV-13341
                    if (COLUMN_DEFAULT === "NULL") {
                        COLUMN_DEFAULT = null;
                    } else if (DATA_TYPE === "varchar") {
                        COLUMN_DEFAULT = COLUMN_DEFAULT.replace(/^['"]/g, "").replace(/['"]$/g, "");
                    } else if (DATA_TYPE === "int") {
                        try {
                            COLUMN_DEFAULT = parseInt(COLUMN_DEFAULT)
                        } catch (e) {
                        }
                    } else if (DATA_TYPE === "decimal") {
                        try {
                            COLUMN_DEFAULT = parseFloat(COLUMN_DEFAULT)
                        } catch (e) {
                        }
                    }

                    dataModelReference[COLUMN_NAME] = {
                        type: DATA_TYPE,
                        value: COLUMN_DEFAULT,
                        key: COLUMN_KEY === "PRI"
                    };
                }
            }
        }
    } else {
        template = null;
    }

    return template;
}


async function createTable(tableName, columns) {
    function _getSqlColumn(column) {
        const {name, type, value, key} = column;
        let defaultValueConstraint = "";
        if ([undefined, null, NaN].indexOf(value) < 0) {
            defaultValueConstraint = `DEFAULT "${value}"`;
        }

        return `${name} ${COLUMN_DATA_TYPE[type]} ${defaultValueConstraint}`;
    }

    let sqlColumns = "";
    let primaryColumns = ["templateId", "templateInstanceId"];

    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const {name, key} = column;

        sqlColumns += `${_getSqlColumn(column)},`;

        if (key) {
            primaryColumns.push(name);
        }
    }

    await asyncMysqlQuery(`
        CREATE TABLE ${tableName} (
            templateRowId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            templateId INT(6) UNSIGNED  NOT NULL,
            templateInstanceId INT(6) UNSIGNED  NOT NULL,
            ${sqlColumns}
            FOREIGN KEY (templateId) REFERENCES template(templateId),
            FOREIGN KEY (templateInstanceId) REFERENCES templateInstance(templateInstanceId)
        );
    `);

    await asyncMysqlQuery(`
        CREATE UNIQUE INDEX ${tableName}_uk ON ${tableName} (${primaryColumns.join(",")})
    `);

    await asyncMysqlQuery(`
        CREATE TABLE history_${tableName} LIKE ${tableName};
    `);

    await asyncMysqlQuery(`
        ALTER TABLE history_${tableName}
            MODIFY COLUMN templateRowId INT(6),
            DROP PRIMARY KEY,
            DROP INDEX ${tableName}_uk,
            ADD COLUMN startDate DATETIME,
            ADD COLUMN endDate DATETIME;
    `);

    await asyncMysqlQuery(`
        CREATE TRIGGER ${tableName}_on_insert AFTER INSERT ON ${tableName}
        FOR EACH ROW
        BEGIN
            INSERT INTO history_${tableName} (
                SELECT *, NOW(), NULL FROM ${tableName}
                WHERE templateRowId = NEW.templateRowId
            );
        END
    `);

    await asyncMysqlQuery(`
        CREATE TRIGGER ${tableName}_on_update AFTER UPDATE ON ${tableName}
        FOR EACH ROW
        BEGIN
            UPDATE history_${tableName} SET endDate = NOW()
            WHERE
                templateRowId = OLD.templateRowId
                AND endDate IS NULL;
            INSERT INTO history_${tableName} (
                SELECT *, NOW(), NULL FROM ${tableName}
                WHERE templateRowId = NEW.templateRowId
            );
        END
    `);

    await asyncMysqlQuery(`
        CREATE TRIGGER ${tableName}_on_delete AFTER DELETE ON ${tableName}
        FOR EACH ROW
        BEGIN
            UPDATE history_${tableName} SET endDate = NOW()
            WHERE
                templateRowId = OLD.templateRowId
                AND endDate IS NULL;
        END
    `);
}
