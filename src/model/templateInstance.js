import {asyncMysqlQuery} from "./util.js";
import logger from "../logger.js";


async function insertObjectsToTable(commonObject, objects, tableName) {
    const tableColumns = await asyncMysqlQuery(`
        SELECT COLUMN_NAME,COLUMN_DEFAULT, DATA_TYPE, COLUMN_KEY 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' AND TABLE_NAME = '${tableName}'
    `);

    let insertQueryColumnsStr = tableColumns.map(({COLUMN_NAME}) => COLUMN_NAME).join(",");

    let getInsertQueryColumnValuesStr = (object) => {
        return tableColumns.map(({COLUMN_NAME}) => {
            let columnValue = null;
            if (commonObject[COLUMN_NAME]) {
                columnValue = commonObject[COLUMN_NAME];
            } else if (object[COLUMN_NAME]) {
                columnValue = object[COLUMN_NAME];
            }

            if (typeof columnValue !== "number") {
                columnValue = `"${columnValue}"`;
            }

            return columnValue;
        }).join(",");
    };

    await asyncMysqlQuery(`
        INSERT INTO ${tableName} (${insertQueryColumnsStr})
        VALUES ${objects.map(object => `(${getInsertQueryColumnValuesStr(object)})`).join(",")}
    `);
}

export async function createTemplateInstance(templateInstanceJson) {
    const {templateId} = templateInstanceJson;
    const templateInstance = await asyncMysqlQuery(`
        INSERT INTO templateInstance (templateId) VALUES ('${templateId}')
    `);

    const templateInstanceId = templateInstance.insertId;
    logger.log('[] -- Created template instance ', templateInstance);

    await insertObjectsToTable({templateId, templateInstanceId}, [templateInstanceJson.data],
        `template_${templateId}`);

    const dataModels = await asyncMysqlQuery(`SELECT templateDataModelId, dataModelName FROM templateDataModel WHERE templateId = ${templateId}`);
    for (let i = 0; i < dataModels.length; i++) {
        const dataModel = dataModels[i];
        const {templateDataModelId, dataModelName} = dataModel;
        await insertObjectsToTable({templateId, templateInstanceId}, templateInstanceJson.data[dataModelName],
            `template_${templateId}_dataModel_${templateDataModelId}`);
    }

    return {templateInstanceId};
}
