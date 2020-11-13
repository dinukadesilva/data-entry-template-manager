import chai from "chai";
import chaiHttp from "chai-http";
import server from "../src/index.js";

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

describe('template', () => {
    beforeEach((done) => {
        //TODO empty the database before each test
        done();
    });

    describe('template', () => {
        it('/POST template', (done) => {
            chai.request(server)
                .post('/template')
                .set('content-type', 'application/json')
                .send({
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
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    expect(res.body.templateId).to.be.a('number')
                    done();
                });
        });
        it('/GET template', (done) => {
            chai.request(server)
                .post('/template')
                .set('content-type', 'application/json')
                .send({
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
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    expect(res.body.templateId).to.be.a('number')

                    chai.request(server)
                        .get(`/template/${res.body.templateId}`)
                        .set('content-type', 'application/json')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            expect(res.body.templateId).to.be.a('number')
                            done();
                        });
                });
        });
    });

    describe('templateInstance', () => {
        it('/POST templateInstance', (done) => {
            chai.request(server)
                .post('/template')
                .set('content-type', 'application/json')
                .send({
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
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    expect(res.body.templateId).to.be.a('number')

                    chai.request(server)
                        .post('/templateInstance')
                        .set('content-type', 'application/json')
                        .send({
                            templateId: res.body.templateId,
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
                        })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            expect(res.body.templateInstanceId).to.be.a('number')

                            done();
                        });
                });
        });
    });
});
