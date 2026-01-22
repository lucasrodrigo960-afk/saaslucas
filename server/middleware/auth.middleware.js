import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export function authenticateToken(req, res, next) {
    // Obter token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Token não fornecido',
            message: 'Acesso negado. Por favor, faça login.'
        });
    }

    try {
        // Verificar e decodificar token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Anexar dados do usuário à requisição
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                message: 'Sua sessão expirou. Por favor, faça login novamente.'
            });
        }

        return res.status(403).json({
            error: 'Token inválido',
            message: 'Token de autenticação inválido.'
        });
    }
}

export default authenticateToken;
