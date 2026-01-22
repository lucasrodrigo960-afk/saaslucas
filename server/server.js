import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, createUser, findUserByEmail } from './database.js';
import { register, login, verifyToken } from './controllers/auth.controller.js';
import { authenticateToken } from './middleware/auth.middleware.js';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Lista de origens permitidas
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // URL do Netlify configurada via env
].filter(Boolean); // Remove undefined

// Middlewares
app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sem origin (mobile apps, Postman, etc)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor rodando' });
});

// Rotas de autenticação
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/verify', authenticateToken, verifyToken);

// Rota protegida de exemplo
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Você acessou uma rota protegida!',
        user: req.user
    });
});

// Handler de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

// Inicializar banco de dados e criar usuário padrão
async function inicializarServidor() {
    try {
        await initializeDatabase();

        // Criar usuário padrão se não existir
        const emailPadrao = 'editor@elite.com';
        const userExistente = await findUserByEmail(emailPadrao);

        if (!userExistente) {
            const senhaPadrao = 'senha123';
            const senhaHash = await bcrypt.hash(senhaPadrao, 10);
            await createUser(emailPadrao, senhaHash, 'Editor Elite');
            console.log('✅ Usuário padrão criado:');
            console.log('   Email:', emailPadrao);
            console.log('   Senha:', senhaPadrao);
        } else {
            console.log('ℹ️  Usuário padrão já existe:', emailPadrao);
        }

        app.listen(PORT, () => {
            console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`\n📋 Rotas disponíveis:`);
            console.log(`   POST /api/auth/register - Registrar novo usuário`);
            console.log(`   POST /api/auth/login - Fazer login`);
            console.log(`   GET  /api/auth/verify - Verificar token`);
            console.log(`   GET  /api/protected - Rota protegida (exemplo)\n`);
        });
    } catch (error) {
        console.error('❌ Erro ao inicializar servidor:', error);
        process.exit(1);
    }
}

inicializarServidor();
