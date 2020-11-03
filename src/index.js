import express from "express"
import {dropTables, initTables} from "./db/util.js";
import {createTemplate, getTemplate} from "./db/template.js";

const app = express();
const port = 3005;

app.get('/dropTables', async (req, res) => {
    await dropTables()

    res.send('Dropped tables')
});

app.get('/createTables', async (req, res) => {
    await initTables()

    res.send('Created tables')
});

app.get('/template/:templateId', async (req, res) => {
    const templateId = req.params['templateId'];
    const template = await getTemplate(templateId);

    res.json(template);
});

app.get('/template', async (req, res) => {
    const templateJson = {
        name: "template 1",
        columns: [
            {name: "countryId", type: "int", key: true},
            {name: "electoralDistrictId", type: "int", key: true},
            {name: "pollingDivisionId", type: "int", key: true},
            {name: "countingCentreId", type: "int", key: true},
            {name: "rejectedVoteCount", type: "decimal", value: 0, key: false},
            {name: "rejectedVoteCountInWords", type: "varchar", value: "", key: false}
        ],
        dataModels: [
            {
                name: "Party wise vote counts",
                columns: [
                    {name: "partyId", type: "int", key: true},
                    {name: "partyName", type: "varchar", value: "", key: false},
                    {name: "voteCount", type: "decimal", value: 0, key: false},
                    {name: "voteCountInWords", type: "varchar", value: "", key: false}
                ]
            }
        ]
    };

    await createTemplate(templateJson);

    res.send('Created Template');
});

app.get('/templateInstance', async (req, res) => {
    const templateInstanceJson = {
        templateId: 1,
        data: {
            "countryId": 1,
            "electoralDistrictId": 1,
            "pollingDivisionId": 1,
            "countingCentreId": 1,
            "rejectedVoteCount": 1,
            "rejectedVoteCountInWords": 1,
            "party_wise_vote_counts": [
                {
                    "partyId": 1,
                    "partyName": "Party 1",
                    "voteCount": 0,
                    "voteCountInWords": ""
                },
                {
                    "partyId": 2,
                    "partyName": "Party 2",
                    "voteCount": 0,
                    "voteCountInWords": ""
                },
                {
                    "partyId": 3,
                    "partyName": "Party 3",
                    "voteCount": 0,
                    "voteCountInWords": ""
                },
                {
                    "partyId": 4,
                    "partyName": "Party 4",
                    "voteCount": 0,
                    "voteCountInWords": ""
                }
            ]
        }
    };

    // await templateInstance.create(templateInstanceJson);

    res.send('Created Template');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
