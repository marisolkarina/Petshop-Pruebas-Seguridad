const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Producto = require('../../src/models/producto');
const { expect } = chai;
const { ObjectId } = require('mongoose').Types;
const MONGODB_URI = 'mongodb+srv://marisol:secreto@cluster0.71urh.mongodb.net/mascotas?retryWrites=true&w=majority&appName=Cluster0';
chai.use(chaiHttp);


describe('Integration Tests', () => {

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
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
        });
    });

});