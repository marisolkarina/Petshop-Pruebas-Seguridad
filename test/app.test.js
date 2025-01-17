const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../src/app');
const Producto = require('../src/models/producto');
const { expect } = chai;
const { ObjectId } = require('mongoose').Types;
const MONGODB_URI = 'mongodb+srv://marisol:secreto@cluster0.71urh.mongodb.net/mascotas?retryWrites=true&w=majority&appName=Cluster0';
chai.use(chaiHttp);


describe('Tests', () => {

    //conexion a la bd
    before((done) => {
        mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => done())
        .catch((err) => done(err))
    });

    //desconeccion de la bd
    after((done) => {
        mongoose.disconnect()
        .then(() => done())
    });

    //limpiar la bd e iniciar con los 2 productos siguientes antes de cada test
    beforeEach((done) => {
        Producto.deleteMany({})
            .then(() => {
                const productos = [
                    {
                        nombre: 'Alfombra cognitiva',
                        urlImagen: 'imagen1.jpg',
                        descripcion: 'Descripción de alfombra',
                        precio: 100,
                        categoria: 'perro',
                        color: 'verde',
                        stock: 10,
                        idUsuario: new ObjectId()
                    },
                    {
                        nombre: 'Polera Less People More Dogs',
                        urlImagen: 'imagen2.jpg',
                        descripcion: 'Descripción de polera',
                        precio: 60,
                        categoria: 'gato',
                        color: 'celeste',
                        stock: 10,
                        idUsuario: new ObjectId()
                    },
                ];
                return Producto.insertMany(productos);
            })
            .then(() => done())
            .catch((err) => done(err));
    });



    describe('GET /productos', () => {
        it('should return all products', (done) => {
            chai
            .request(app)
            .get('/productos')
            .query({pagina: 1})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
                expect(res.text).to.include('Productos de la tienda') //titulo
                expect(res.text).to.include('Alfombra cognitiva'); //1er prod
                expect(res.text).to.include('Polera Less People More Dogs'); //2do prod
                done();
            });
        });
    });

});

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