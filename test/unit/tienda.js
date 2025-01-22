const Producto = require('../../src/models/producto');

jest.mock('../../src/models/producto');
const { getProductos, getProductosPorCategoria, postEliminarProductoCarrito } = require('../../src/controllers/tienda');

jest.mock('../../src/models/producto');
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({
        isEmpty: jest.fn(() => true),
        array: jest.fn(() => []),
    })),
}));

describe('Tienda de productos', () => {
    beforeEach(() => {
        Producto.find.mockClear();
    });

    test('should return all products', async () => {

        const productosMock = [
            {
                _id: '60c72b1f9a934e001c8c0c85',
                nombre: 'Alfombra cognitiva',
                urlImagen: "url1",
                descripcion: "Alfombra cognitiva descripcion",
                precio: 100,
                categoria: 'perro',
                color: 'verde',
                stock: 10,
                idUsuario: '1'
            },
            {
                _id: '60c72b1f9a934e001c8c0c86',
                nombre: 'Polera',
                urlImagen: "url2",
                descripcion: "Polera descripcion",
                precio: 200,
                categoria: 'gato',
                color: 'celeste',
                stock: 5,
                idUsuario: '2'
            },
        ];

        Producto.find.mockResolvedValue(productosMock);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getProductos(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Productos de la tienda',
            prods: productosMock,
        });
    });

    test('should return a list of products by category', async () => {

        const productosMock = [
            {
                _id: '60c72b1f9a934e001c8c0c85',
                nombre: 'Alfombra cognitiva',
                urlImagen: "url1",
                descripcion: "Alfombra cognitiva descripcion",
                precio: 100,
                categoria: 'perro',
                color: 'verde',
                stock: 10,
                idUsuario: '1'
            },
            {
                _id: '60c72b1f9a934e001c8c0c86',
                nombre: 'Polera',
                urlImagen: "url2",
                descripcion: "Polera descripcion",
                precio: 200,
                categoria: 'gato',
                color: 'celeste',
                stock: 5,
                idUsuario: '2'
            },
        ];

        Producto.find.mockResolvedValue(productosMock);

        const req = {
            params: { categoria: 'perro' },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getProductosPorCategoria(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Productos Filtrados',
            prods: [{
                _id: '60c72b1f9a934e001c8c0c85',
                nombre: 'Alfombra cognitiva',
                urlImagen: "url1",
                descripcion: "Alfombra cognitiva descripcion",
                precio: 100,
                categoria: 'perro',
                color: 'verde',
                stock: 10,
                idUsuario: '1'
            }]
        });
    });


    test('should delete a product from the cart', async () => {
        const productoMock = {
            _id: '60c72b1f9a934e001c8c0c85',
            nombre: 'Alfombra cognitiva',
            urlImagen: "url1",
            descripcion: "Alfombra cognitiva descripcion",
            precio: 100,
            categoria: 'perro',
            color: 'verde',
            stock: 10,
            idUsuario: '1',
        };
    
        const usuarioMock = {
            deleteItemDelCarrito: jest.fn().mockResolvedValue(true), // Simula la eliminación
        };
    
        Producto.findById.mockResolvedValue(productoMock); // Simula que el producto existe
    
        const req = {
            body: { idProducto: productoMock._id },
            usuario: usuarioMock,
        };
    
        const res = {
            redirect: jest.fn(), // Mock de redirección
        };
    
        await postEliminarProductoCarrito(req, res);
    
        // Validaciones
        expect(Producto.findById).toHaveBeenCalledWith(productoMock._id);
        expect(req.usuario.deleteItemDelCarrito).toHaveBeenCalledWith(productoMock._id, productoMock);
        expect(res.redirect).toHaveBeenCalledWith('/carrito');// Redirección 
    });
    
    

    test('should handle error when product does not exist', async () => {
        Producto.findById.mockResolvedValue(null); // Simula que el producto no existe

        const req = {
            body: { idProducto: 'invalidId' },
            usuario: {
                deleteItemDelCarrito: jest.fn(),
            },
        };

        const res = {
            redirect: jest.fn(),
        };

        await postEliminarProductoCarrito(req, res);

        expect(Producto.findById).toHaveBeenCalledWith('invalidId'); // Validar que se intenta buscar
        expect(req.usuario.deleteItemDelCarrito).not.toHaveBeenCalled(); // No debería intentar eliminar
        expect(res.redirect).toHaveBeenCalledWith('/carrito'); // Redirección 
    });

});
