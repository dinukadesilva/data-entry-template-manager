import {asyncMysqlQuery} from "./util.js";



export async function create(templateJson) {
    // const template = await asyncMysqlQuery(`
    //     INSERT INTO template (templateName) VALUES ('${templateJson.name}');
    // `);
    // const templateId = template.insertId;
    // logger.log('[] -- Created template ', template);
    //
    // await asyncMysqlQuery(_getSqlTable(`template_${templateId}`, templateJson.columns));
    //
    // templateJson.dataModels.map(async (dataModel) => {
    //     const {name, columns} = dataModel;
    //     await asyncMysqlQuery(`
    //         INSERT INTO templateDataModel (templateId, dataModelName) VALUES ('${templateId}', '${name}');
    //     `);
    //     const templateDataModelTableNameSuffix = name.replace(/ /g, "_").toLowerCase();
    //
    //     await asyncMysqlQuery(_getSqlTable(
    //         `templateDataModel_${templateId}_${templateDataModelTableNameSuffix}`, dataModel.columns
    //     ));
    // });
}
