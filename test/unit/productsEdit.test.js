const Producto = require('../../src/models/producto');
const { postEditarProducto } = require('../../src/controllers/admin');
const { validationResult } = require('express-validator');

jest.mock('../../src/models/producto');
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({
        isEmpty: () => true,
        array: () => [],
    })),
}));

describe('Admin - Editar Producto', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            params: { idProducto: '60c72b1f9a934e001c8c0c85' },
            body: {
                nombre: 'Producto Actualizado',
                urlImagen: 'url-nueva',
                descripcion: 'Nueva descripción es suficientemente larga',
                precio: 150,
                descuento: 20,
                fechaExpiracion: '2025-12-31',
                categoria: 'perro',
                color: 'azul',
                stock: 30
            },
            usuario: { role: 'admin' }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('Debe editar el producto con éxito como admin', async () => {
        const productoGuardado = {
            _id: mockReq.params.idProducto,
            ...mockReq.body,
            descuento: {
                valor: mockReq.body.descuento,
                fechaExpiracion: mockReq.body.fechaExpiracion
            }
        };

        const mockProducto = {
            _id: mockReq.params.idProducto,
            save: jest.fn().mockResolvedValue(productoGuardado)
        };

        validationResult.mockReturnValue({ isEmpty: () => true });
        Producto.findById.mockResolvedValue(mockProducto);

        await postEditarProducto(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('No debe editar el producto sin el rol de administrador', async () => {
        mockReq.usuario.role = 'user';

        await postEditarProducto(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'No tiene rol de admin.'
        });
    });

    test('Debe fallar si no se encuentra el producto', async () => {
        Producto.findById.mockResolvedValue(null);

        await postEditarProducto(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'No existe el producto.'
        });
    });

    test('Debe validar los campos vacíos', async () => {
        mockReq.body = {
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

        await postEditarProducto(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Campos requeridos'
        });
    });

    test('Debe validar el precio no válido', async () => {
        mockReq.body.precio = -100;
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'El precio debe ser mayor a 0' }]
        });

        await postEditarProducto(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'El precio debe ser mayor a 0'
        });
    });

    test('Debe validar stock inválido', async () => {
        mockReq.body.stock = -10;
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'El stock debe ser mayor o igual a 0' }]
        });

        await postEditarProducto(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'El stock debe ser mayor o igual a 0'
        });
    });

    test('Debe fallar si la descripción es muy corta', async () => {
        mockReq.body.descripcion = 'Corta';
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'La descripción debe tener entre 10 y 1000 caracteres' }]
        });

        await postEditarProducto(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'La descripción debe tener entre 10 y 1000 caracteres'
        });
    });

    test('Debe fallar si el nombre es muy corto', async () => {
        mockReq.body.nombre = 'ab';
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'El nombre debe tener entre 3 y 50 caracteres' }]
        });

        await postEditarProducto(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'El nombre debe tener entre 3 y 50 caracteres'
        });
    });

    test('Debe gestionar el error de la base de datos', async () => {
        const mockProducto = {
            _id: mockReq.params.idProducto,
            descuento: {}
        };
        
        validationResult.mockReturnValue({ isEmpty: () => true });
        Producto.findById.mockImplementation(() => Promise.reject(new Error('Error DB')));
        
        await postEditarProducto(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
});