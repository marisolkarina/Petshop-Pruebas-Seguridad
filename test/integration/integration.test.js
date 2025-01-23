const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Producto = require('../../src/models/producto');
const { expect } = chai;
const { ObjectId } = require('mongoose').Types;

const MONGODB_URI = 'mongodb+srv://marisol:secreto@cluster0.71urh.mongodb.net/mascotas?retryWrites=true&w=majority&appName=Cluster0';
chai.use(chaiHttp);

describe('Test de integración', function() {
    this.timeout(10000);

    before(function(done) {
        mongoose.connect(MONGODB_URI)
            .then(() => done())
            .catch(done);
    });

    after(function(done) {
        mongoose.connection.close()
            .then(() => {
                process.exit(0);
            })
            .catch(done);
    });

    beforeEach(function(done) {
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
                        idUsuario: new ObjectId(),
                        descuento: {
                            valor: 0,
                            fechaExpiracion: new Date()
                        },
                        comentarios: []
                    },
                    {
                        nombre: 'Polera Less People More Dogs',
                        urlImagen: 'imagen2.jpg',
                        descripcion: 'Descripción de polera',
                        precio: 60,
                        categoria: 'gato',
                        color: 'celeste',
                        stock: 10,
                        idUsuario: new ObjectId(),
                        descuento: {
                            valor: 0,
                            fechaExpiracion: new Date()
                        },
                        comentarios: []
                    }
                ];
                return Producto.insertMany(productos);
            })
            .then(() => done())
            .catch(done);
    });

    describe('GET /productos', function() {
        it('Debe devolver todos los productos con la estructura correcta', function(done) {
            chai
                .request(app)
                .get('/productos')
                .end((err, res) => {
                    try {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('message', 'Productos de la tienda');
                        expect(res.body).to.have.property('prods').that.is.an('array');
                        expect(res.body.prods).to.have.lengthOf(2);
                        
                        const producto = res.body.prods[0];
                        expect(producto).to.have.all.keys(
                            '_id',
                            'nombre',
                            'urlImagen',
                            'descripcion',
                            'precio',
                            'categoria',
                            'color',
                            'stock',
                            'comentarios',
                            'idUsuario',
                            'descuento',
                            '__v'
                        );
                        done();
                    } catch (error) {
                        done(error);
                    }
                });
        });
    });
});