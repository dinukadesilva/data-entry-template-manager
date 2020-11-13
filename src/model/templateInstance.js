import {asyncMysqlQuery} from "./util.js";
import logger from "../logger.js";


export async function createTemplateInstance(templateInstanceJson) {
    const templateInstance = await asyncMysqlQuery(`
        INSERT INTO templateInstance (templateId) VALUES ('${templateInstanceJson.templateId}');
    `);

    const templateInstanceId = templateInstance.insertId;
    logger.log('[] -- Created template instance ', templateInstance);

    return {templateInstanceId};
}
