const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../src/app');

const Producto = require('../src/models/producto');
chai.use(chaiHttp);

//pruebas unitarias
//getProductos - alexia
//getProductosPorCategoria - marisol
//crear producto - marisol
//editar prod - christian
//eliminar prod - anthony


//prueba de carga - anthony (load-test.yml)




//EJEMPLOS DEL PROFESOR..................................................

    // describe('GET /api/users', () => {
    //     it('should return all users', (done) => {
    //     chai
    //         .request(app)
    //         .get('/api/users')
    //         .end((err, res) => {
    //             expect(res).to.have.status(200);
    //             expect(res.body).to.be.an('array');
    //             expect(res.body.length).to.be.greaterThan(0);
    //             done();
    //         });
    //     });
    // });


    // describe('POST /api/users', () => {
    //     it('should create a new user', (done) => {
    //         const newUser = { name: 'Charlie', age: 35 };
    //         chai
    //         .request(app)
    //         .post('/api/users')
    //         .send(newUser)
    //         .end((err, res) => {
    //             expect(res).to.have.status(201);
    //             expect(res.body).to.be.an('object');
    //             expect(res.body).to.have.property('id');
    //             expect(res.body.name).to.equal('Charlie');
    //             expect(res.body.age).to.equal(35);
    //             done();
    //         });
    //     });
    //     it('should return 400 for invalid input', (done) => {
    //         chai
    //             .request(app)
    //             .post('/api/users')
    //             .send({ name: 'Charlie' }) // Falta el campo "age"
    //             .end((err, res) => {
    //                 expect(res).to.have.status(400);
    //                 expect(res.body).to.have.property('message', 'Invalid input');
    //                 done();
    //             });
    //     });
    // });


    // describe('GET /api/users/:id', () => {
    //     it('should return a user by ID', (done) => {
    //         chai
    //         .request(app)
    //         .get('/api/users/1')
    //         .end((err, res) => {
    //             expect(res).to.have.status(200);
    //             expect(res.body).to.be.an('object');
    //             expect(res.body.name).to.equal('Alice');
    //             done();
    //         });
    //     });

    //     it('should return 404 for non-existent user', (done) => {
    //         chai
    //         .request(app)
    //         .get('/api/users/999')
    //         .end((err, res) => {
    //             expect(res).to.have.status(404);
    //             expect(res.body).to.have.property('message', 'User not found');
    //             done();
    //         });
    //     });
    // });