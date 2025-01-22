const Producto = require('../../src/models/producto');

jest.mock('../../src/models/producto');
const { postEliminarProducto } = require('../../src/controllers/admin');
const { postCrearProducto, postEditarProducto } = require('../../src/controllers/admin');
const { validationResult } = require('express-validator');

jest.mock('../../src/models/producto');
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({
        isEmpty: jest.fn(() => true),
        array: jest.fn(() => []),
    })),
}));

//Pruebas para el admin controller
describe('Funciones de admin: crud de productos', () => {
    beforeEach(() => {

        req = {
            params: { idProducto: '60c72b1f9a934e001c8c0c85' },
            body: {
                nombre: 'Alfombra cognitiva',
                urlImagen: 'url1',
                descripcion: 'Alfombra cognitiva descripcion',
                precio: 100,
                descuento: 10,
                fechaExpiracion: '2025-01-25',
                categoria: 'perro',
                color: 'verde',
                stock: 10
            },
            usuario: { _id: '12345', role: 'admin' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();


    });

    // Pruebas para crear producto

    test('should create a product (admin)', async () => {
        const nombre = 'Alfombra cognitiva';
        const urlImagen = "url1";
        const descripcion = "Alfombra cognitiva descripcion";
        const precio = 100;
        const descuento = 10;
        const fechaExpiracion = '2025-01-25';
        const categoria = 'perro';
        const color = 'verde';
        const stock = 10;

        // simulamos el producto que se crea
        const prod = {
            _id: '60c72b1f9a934e001c8c0c85',
            nombre: req.body.nombre,
            urlImagen: req.body.urlImagen,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            descuento: { valor: req.body.descuento, fechaExpiracion: req.body.fechaExpiracion },
            categoria: req.body.categoria,
            stock: req.body.stock
        }
        const productoMock = {
            ...prod,
            idUsuario: req.usuario._id,
            save: jest.fn().mockResolvedValue(), // Simula save exitoso
        };

        // Simulamos el comportamiento del modelo
        Producto.mockImplementation(() => productoMock);

        await postCrearProducto(req, res);

        expect(Producto).toHaveBeenCalledWith({
            nombre,
            urlImagen,
            descripcion,
            precio,
            descuento: { valor: descuento, fechaExpiracion },
            categoria,
            color,
            stock,
            comentarios: [],
            idUsuario: req.usuario._id,
        });

        expect(productoMock.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Producto creado',
            producto: productoMock,
        });
    });

    test('should not create a product if user is not admin', async () => {
        const req = {
            body: {
                nombre: 'Alfombra cognitiva',
                urlImagen: 'url1',
                descripcion: 'Alfombra cognitiva descripcion',
                precio: 100,
                descuento: 10,
                fechaExpiracion: '2025-01-25',
                categoria: 'perro',
                color: 'verde',
                stock: 10,
            },
            usuario: { // usuario logueado no es admin
                _id: '12345',
                role: 'user',
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await postCrearProducto(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'No tiene rol de admin.',
        });
    });


    //Pruebas para editar producto
    test('Debe editar el producto con éxito como admin', async () => {
            const productoGuardado = {
                _id: req.params.idProducto,
                ...req.body,
                descuento: {
                    valor: req.body.descuento,
                    fechaExpiracion: req.body.fechaExpiracion
                },
                comentarios: []
            };
    
            const mockProducto = {
                _id: req.params.idProducto,
                ...productoGuardado,
                idUsuario: req.usuario._id,
                save: jest.fn().mockResolvedValue(productoGuardado)
            };
    
            validationResult.mockReturnValue({ isEmpty: () => true });
            Producto.findById.mockResolvedValue(mockProducto);
    
            await postEditarProducto(req, res);
    
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Producto editado',
                producto: mockProducto
            });
            expect(mockProducto.save).toHaveBeenCalled();
        });
    
    test('No debe editar el producto sin el rol de administrador', async () => {
        req.usuario.role = 'user';

        await postEditarProducto(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'No tiene rol de admin.'
        });
    });
    
    test('Debe fallar si no se encuentra el producto', async () => {
        Producto.findById.mockResolvedValue(null);

        await postEditarProducto(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'No existe el producto.'
        });
    });
    
    test('Debe validar los campos vacíos', async () => {
        req.body = {
            nombre: '',
            urlImagen: '',
            descripcion: '',
            precio: '',
            categoria: '',
            color: '',
            stock: ''
        };
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Campos requeridos' }]
        });

        await postEditarProducto(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Campos requeridos'
        });
    });
    
    test('Debe validar el precio no válido', async () => {
        req.body.precio = -100;
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'El precio debe ser mayor a 0' }]
        });

        await postEditarProducto(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: 'El precio debe ser mayor a 0'
        });
    });
    
    test('Debe validar stock inválido', async () => {
        req.body.stock = -10;
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'El stock debe ser mayor o igual a 0' }]
        });

        await postEditarProducto(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: 'El stock debe ser mayor o igual a 0'
        });
    });
    
    test('Debe fallar si la descripción es muy corta', async () => {
        req.body.descripcion = 'Corta';
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'La descripción debe tener entre 10 y 1000 caracteres' }]
        });

        await postEditarProducto(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: 'La descripción debe tener entre 10 y 1000 caracteres'
        });
    });
    
    test('Debe fallar si el nombre es muy corto', async () => {
        req.body.nombre = 'ab';
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'El nombre debe tener entre 3 y 50 caracteres' }]
        });

        await postEditarProducto(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: 'El nombre debe tener entre 3 y 50 caracteres'
        });
    });

    // Pruebas para eliminar producto
    test('should delete a product as admin', async () => {
        // Mock del producto
        const productoMock = {
            _id: '60c72b1f9a934e001c8c0c85',
            nombre: req.body.nombre,
            urlImagen: req.body.urlImagen,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            descuento: { valor: req.body.descuento, fechaExpiracion: req.body.fechaExpiracion },
            categoria: req.body.categoria,
            color: req.body.color,
            stock: req.body.stock,
            idUsuario: req.usuario._id,
        };

        Producto.findById.mockResolvedValue(productoMock); // Simula que el producto existe
        Producto.findByIdAndDelete.mockResolvedValue(); // Simula la eliminación exitosa

        await postEliminarProducto(req, res);

        expect(Producto.findById).toHaveBeenCalledWith(productoMock._id); // Validar que se busca el producto
        expect(Producto.findByIdAndDelete).toHaveBeenCalledWith(productoMock._id); // Validar que se elimina
        expect(res.status).toHaveBeenCalledWith(200); // Respuesta de éxito
        expect(res.json).toHaveBeenCalledWith({ message: 'Producto eliminado.' });
    });

    test('should not delete a product if not admin', async () => {
        const req = {
            params: { idProducto: '60c72b1f9a934e001c8c0c85' },
            usuario: { role: 'user' },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await postEliminarProducto(req, res);

        expect(res.status).toHaveBeenCalledWith(500); // Error por falta de permisos
        expect(res.json).toHaveBeenCalledWith({ message: 'No tiene rol de admin.' });
        expect(Producto.findById).not.toHaveBeenCalled(); // No debería buscar en la DB
    });

});