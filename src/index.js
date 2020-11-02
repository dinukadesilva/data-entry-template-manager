import express from "express"
import {create} from "./db/template.js";
import {dropTables, initTables} from "./db/util.js";

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

    await create(templateJson);

    res.send('Created Template');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
