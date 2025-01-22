const Producto = require('../../src/models/producto');
const { postEditarProducto } = require('../../src/controllers/admin');
const { validationResult } = require('express-validator');

jest.mock('../../src/models/producto');
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({
        isEmpty: jest.fn(() => true),
        array: jest.fn(() => []),
    })),
}));

describe('Admin - Editar Producto', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            params: { idProducto: '60c72b1f9a934e001c8c0c85' },
            body: {
                nombre: 'Producto Actualizado',
                urlImagen: 'url-nueva',
                descripcion: 'Nueva descripción',
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
        mockNext = jest.fn();
        
        // Reset mocks
        jest.clearAllMocks();
    });

    test('Debe editar el producto con éxito como admin', async () => {
        const mockProducto = {
            _id: mockReq.params.idProducto,
            ...mockReq.body,
            descuento: {
                valor: mockReq.body.descuento,
                fechaExpiracion: mockReq.body.fechaExpiracion
            },
            save: jest.fn().mockResolvedValue({
                _id: mockReq.params.idProducto,
                ...mockReq.body,
            })
        };
        
        Producto.findById.mockResolvedValue(mockProducto);
        
        await postEditarProducto(mockReq, mockRes);
    
        expect(mockProducto.save).toHaveBeenCalled();
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
            array: () => [{msg: 'Campos requeridos'}]
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
            array: () => [{msg: 'El precio debe ser mayor a 0'}]
        });
     
        await postEditarProducto(mockReq, mockRes);
     
        expect(mockRes.status).toHaveBeenCalledWith(422);
     });
     
     test('Debe validar stock inválido', async () => {
        mockReq.body.stock = -10;
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{msg: 'El stock debe ser mayor o igual a 0'}]
        });
     
        await postEditarProducto(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(422);
     });
     
     test('Debe gestionar el error de la base de datos', async () => {
        const mockProducto = {
            _id: mockReq.params.idProducto,
            save: jest.fn().mockRejectedValue(new Error('Error al guardar'))
        };
        
        Producto.findById.mockResolvedValue(mockProducto);
        validationResult.mockReturnValue({ isEmpty: () => true });
    
        await postEditarProducto(mockReq, mockRes);
    
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ 
            message: expect.any(String)
        });
    });
});