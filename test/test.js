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
                    data: {
                        "countryId": {type: "int", key: true},
                        "electoralDistrictId": {type: "int", key: true},
                        "pollingDivisionId": {type: "int", key: true},
                        "countingCentreId": {type: "int", key: true},
                        "rejectedVoteCount": {type: "decimal", value: 0, key: false},
                        "rejectedVoteCountInWords": {type: "varchar", value: "", key: false},
                        "party_wise_vote_counts": {
                            "partyId": {type: "int", key: true},
                            "partyName": {type: "varchar", value: "", key: false},
                            "voteCount": {type: "decimal", value: 0, key: false},
                            "voteCountInWords": {type: "varchar", value: "", key: false}
                        }
                    }
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
                    data: {
                        "countryId": {type: "int", key: true},
                        "electoralDistrictId": {type: "int", key: true},
                        "pollingDivisionId": {type: "int", key: true},
                        "countingCentreId": {type: "int", key: true},
                        "rejectedVoteCount": {type: "decimal", value: 0, key: false},
                        "rejectedVoteCountInWords": {type: "varchar", value: "", key: false},
                        "party_wise_vote_counts": {
                            "partyId": {type: "int", key: true},
                            "partyName": {type: "varchar", value: "", key: false},
                            "voteCount": {type: "decimal", value: 0, key: false},
                            "voteCountInWords": {type: "varchar", value: "", key: false}
                        }
                    }
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
                    data: {
                        "countryId": {type: "int", key: true},
                        "electoralDistrictId": {type: "int", key: true},
                        "pollingDivisionId": {type: "int", key: true},
                        "countingCentreId": {type: "int", key: true},
                        "rejectedVoteCount": {type: "decimal", value: 0, key: false},
                        "rejectedVoteCountInWords": {type: "varchar", value: "", key: false},
                        "party_wise_vote_counts": {
                            "partyId": {type: "int", key: true},
                            "partyName": {type: "varchar", value: "", key: false},
                            "voteCount": {type: "decimal", value: 0, key: false},
                            "voteCountInWords": {type: "varchar", value: "", key: false}
                        }
                    }
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    expect(res.body.templateId).to.be.a('number')

                    Promise.all([
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
                            }),
                        chai.request(server)
                            .post('/templateInstance')
                            .set('content-type', 'application/json')
                            .send({
                                templateId: res.body.templateId,
                                data: {
                                    "countryId": 1,
                                    "electoralDistrictId": 1,
                                    "pollingDivisionId": 2,
                                    "countingCentreId": 2,
                                    "rejectedVoteCount": null,
                                    "rejectedVoteCountInWords": 1,
                                    "party_wise_vote_counts": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                                        18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
                                        39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
                                    ].map(partyId => {
                                        return {
                                            "partyId": partyId,
                                            "partyName": `Party ${partyId}`,
                                            "voteCount": null,
                                            "voteCountInWords": null
                                        }
                                    })
                                }
                            })
                    ]).then(responses => {
                        responses[0].should.have.status(200);
                        responses[0].body.should.be.a('object');
                        expect(responses[0].body.templateInstanceId).to.be.a('number')


                        responses[1].should.have.status(200);
                        responses[1].body.should.be.a('object');
                        expect(responses[1].body.templateInstanceId).to.be.a('number')

                        done();
                    });

                });
        });
    });
});
