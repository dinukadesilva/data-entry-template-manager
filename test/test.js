import chai from "chai";
import chaiHttp from "chai-http";
import server from "../src/index.js";

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

describe('Books', () => {
    beforeEach((done) => {
        //TODO empty the database before each test
        done();
    });

    describe('/POST template', () => {
        it('it should create the template', (done) => {
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

            chai.request(server)
                .post('/template')
                .send(templateJson)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    expect(res.body.templateId).to.be.a('number')
                    done();
                });
        });
    });
});
