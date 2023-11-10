const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware pour vérifier le token JWT
function authenticationMiddleware(req, res, next) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        jwt.verify(token, secret, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token invalide' });
            }

            try {
                const user = await User.findByPk(decoded.id, { include: 'Role' });

                if (!user) {
                    return res.status(401).json({ message: 'Utilisateur non trouvé' });
                }

                req.user = { ...decoded, role: user.Role.name };
                next();
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur depuis la base de données:', error);
                res.status(500).json({ error: 'Erreur interne du serveur' });
            }
        });
    } else {
        res.status(401).json({ message: 'Token manquant' });
    }
}
function ADMINauthenticationMiddleware(req, res, next) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        jwt.verify(token, secret, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token invalide' });
            }

            try {
                const user = await User.findByPk(decoded.id, { include: 'Role' });

                if (!user) {
                    return res.status(401).json({ message: 'Utilisateur non trouvé' });
                }

                // Vérifier si le roleId est égal à 2 (admin)
                if (user.Role && user.Role.id === 2) {
                    req.user = { ...decoded, role: user.Role.name };
                    next();
                } else {
                    return res.status(403).json({ error: 'Accès non autorisé. Rôle admin requis.' });
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur depuis la base de données:', error);
                res.status(500).json({ error: 'Erreur interne du serveur' });
            }
        });
    } else {
        res.status(401).json({ message: 'Token manquant' });
    }
}

module.exports = {
    authenticationMiddleware,
    ADMINauthenticationMiddleware
};
