import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";


import {createTemplate, getTemplate} from "./model/template.js";
import logger from "./logger.js";
import {createTemplateInstance} from "./model/templateInstance.js";

const port = 3005;
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/template/:templateId', async (req, res, next) => {
    const templateId = req.params['templateId'];
    const template = await getTemplate(templateId).catch(next);

    res.json(template);
});

app.post('/template', async (req, res, next) => {
    const templateJson = req.body;
    let template = await createTemplate(templateJson).catch(next);

    res.json(template);
});

app.post('/templateInstance', async (req, res, next) => {
    const templateInstanceJson = req.body;
    let templateInstance = await createTemplateInstance(templateInstanceJson).catch(next);

    res.json(templateInstance);
});

app.listen(port, () => {
    logger.log(`Example app listening at http://localhost:${port}`)
});

export default app; // for testing
