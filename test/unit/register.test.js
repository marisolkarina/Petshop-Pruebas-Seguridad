const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Usuario = require('../../src/models/usuario');
const loginController = require('../../src/controllers/login');

jest.mock('bcryptjs');
jest.mock('../../src/models/usuario');
jest.mock('express-validator');
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true)
    })
}));

describe('Registro de Usuario', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                nombre: 'Test User',
                dni: '12345678',
                email: 'test@test.com',
                password: 'Test123!'
            }
        };
        
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });

        const mockSave = jest.fn().mockResolvedValue({});
        Usuario.mockImplementation(() => ({
            save: mockSave
        }));

        bcrypt.hash.mockResolvedValue('hashedPassword');
    });

    test('Debería registrar un usuario exitosamente', async () => {
        await loginController.postRegistrarse(req, res);
        await new Promise(process.nextTick);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Registro exitoso'
        });
    });

    test('Debería fallar con datos de validación incorrectos', async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{msg: 'Datos inválidos'}]
        });

        await loginController.postRegistrarse(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
    });

    test('Debería manejar error al hashear password', async () => {
        bcrypt.hash.mockRejectedValue(new Error('Error de hasheo'));
        
        await loginController.postRegistrarse(req, res);
        await new Promise(process.nextTick);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('Debería manejar error al guardar usuario', async () => {
        Usuario.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(new Error('Error al guardar'))
        }));

        await loginController.postRegistrarse(req, res);
        await new Promise(process.nextTick);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('Debería validar el formato del DNI', async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{msg: 'DNI debe tener 8 dígitos'}]
        });
        
        req.body.dni = '123';
        
        await loginController.postRegistrarse(req, res);
        
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: 'DNI debe tener 8 dígitos'
        });
    });

    test('Debería validar el formato del email', async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{msg: 'Email inválido'}]
        });
        
        req.body.email = 'invalido';
        
        await loginController.postRegistrarse(req, res);
        
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Email inválido'
        });
    });

    test('Debería validar la seguridad de la contraseña', async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{msg: 'La contraseña debe tener al menos 8 caracteres'}]
        });
        
        req.body.password = '123';
        
        await loginController.postRegistrarse(req, res);
        
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: 'La contraseña debe tener al menos 8 caracteres'
        });
    });
});