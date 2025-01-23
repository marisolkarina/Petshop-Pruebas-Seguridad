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














/*
describe('Login de usuario', () => {
    let req, res, mockUser;

    beforeEach(() => {
        // Simula el objeto `req` con una sesión
        req = {
            body: {
                email: 'espinozaromero1999@gmail.com',
                password: 'Usuario01!',
            },
            session: {
                save: jest.fn((callback) => callback(null)), // Simula guardar la sesión sin errores
                autenticado: false,
                usuario: null,
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => [],
        });

        mockUser = {
            _id: 'userId123',
            email: req.body.email,
            nombre: 'Test User',
            dni: '12345678',
            password: 'hashedPassword',
            role: 'user',
            tokenLogin: null,
            save: jest.fn().mockResolvedValue(true), // Simula que el save es exitoso
        };
    });

    test('Debería iniciar sesión exitosamente con credenciales válidas', async () => {
        Usuario.findOne = jest.fn().mockResolvedValue(mockUser);

        bcrypt.compare = jest.fn().mockResolvedValue(true);

        await loginController.postLogin(req, res);

        expect(Usuario.findOne).toHaveBeenCalledWith({ email: req.body.email });
        expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);

        expect(req.session.autenticado).toBe(true);
        expect(req.session.usuario).toEqual({
            _id: mockUser._id,
            email: mockUser.email,
            nombre: mockUser.nombre,
            dni: mockUser.dni,
            password: mockUser.password,
            role: mockUser.role,
            tokenLogin: expect.any(String), // Verifica que el token esté definido
        });

        expect(req.session.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Login exitoso',
            tokenLogin: expect.any(String),
    });
});
    test('Debería fallar con credenciales inválidas', async () => {
        Usuario.findOne.mockResolvedValue(null);

        await loginController.postLogin(req, res);

        expect(Usuario.findOne).toHaveBeenCalledWith({ email: req.body.email });
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email o contraseña inválido' });
    });

    test('Debería manejar errores inesperados', async () => {
        Usuario.findOne.mockRejectedValue(new Error('Error inesperado'));

        await loginController.postLogin(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error inesperado' });
    });
});*/