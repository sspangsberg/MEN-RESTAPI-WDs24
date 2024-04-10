const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

describe('User workflow tests - 2', () => {

    it('invalid user input test', (done) => {

        // 1) Register new user with invalid inputs
        let user = {
            name: "Lars Larsen",
            email: "mail@larsen.com",
            password: "123456" //Faulty password - Joi/validation should catch this...
        }
        chai.request(server)
            .post('/api/user/register')
            .send(user)
            .end((err, res) => {
                                
                // Asserts
                expect(res.status).to.be.equal(400);
                expect(res.body).to.be.a('object');
             //   expect(res.body.error).to.be.equal("\"password\" length must be at least 6 characters long");  
                
                done();              
            });
    });
});