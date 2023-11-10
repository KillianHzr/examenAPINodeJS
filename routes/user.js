const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { authenticationMiddleware, ADMINauthenticationMiddleware } = require('../middlewares/auth');


function generateToken(id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET);
}

// Récupérer tous les utilisateurs
router.get('/', ADMINauthenticationMiddleware, async (req, res) => {
    try {
        const users = await User.findAll({ include: 'Role' });

        // Mapper les utilisateurs pour inclure le nom du rôle au lieu de l'ID
        const usersWithRoleNames = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.Role ? user.Role.title : null,
        }));

        res.json(usersWithRoleNames);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
});

// Récupérer tous les utilisateurs
router.get('/:id', ADMINauthenticationMiddleware, async (req, res) => {
const userId = parseInt(req.params.id);

try {
    // Vérifier si l'utilisateur existe et le renvoyer au format JSON
    if (userId) {
        // Récupérer l'utilisateur avec les tags pour la réponse
        const userWithRole = await User.findByPk(userId, { include: 'Role' });

        // Renvoyer l'utilisateur créé au format JSON avec le nom du rôle
        res.status(201).json({
            id: userWithRole.id,
            username: userWithRole.username,
            email: userWithRole.email,
            role: userWithRole.Role ? userWithRole.Role.title : null,
        });
    } else {
        // Renvoyer une réponse 404 si l'utilisateur n'est pas trouvé
        res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
} catch (error) {
    // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
    console.log("Erreur lors de la récupération de l'utilisateur depuis la base de données:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
}
});

// Inscription utilisateur
router.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;

    try {
        const authorizationHeader = req.headers.authorization;
        const tokenUsed = authorizationHeader ? authorizationHeader.split(' ')[1] : null;

        var RoleIdDefini = 1;

        if (tokenUsed) {
            const decoded = jwt.verify(tokenUsed, process.env.JWT_SECRET);
            const user = await User.findOne({ where: { id: decoded.id } });

            if (user.RoleId === 1) {
                // Empêche l'inscription si connecté
                return res.json({ message: "Vous êtes déjà connecté." });
            } else if (user.RoleId === 2) {
                // Défini le rôle du nouvel utilisateur à "admin" si connecté en tant qu'Admin
                RoleIdDefini = 2; 
            }
        } else {
            // Défini le rôle du nouvel utilisateur à "client" si déconnecté
            RoleIdDefini = 1;
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "L'utilisateur existe déjà" });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // Créer un nouvel utilisateur avec l'identifiant du rôle
        const newUser = await User.create({
            email,
            password: hashedPassword,
            username,
            RoleId: RoleIdDefini, // Utiliser l'identifiant du rôle
        });

        // Générer un token JWT pour l'utilisateur
        const token = generateToken(newUser.id);
        
        const userRole = await Role.findOne({ where: { id: newUser.RoleId } });

        if (userRole) {
            roleName = userRole.title;
        }
        res.status(201).json({
            message: "Inscription effectuée avec succès",
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: roleName,
            },
        });    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Connexion utilisateur
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const authorizationHeader = req.headers.authorization;
        const tokenUsed = authorizationHeader ? authorizationHeader.split(' ')[1] : null;

        if (tokenUsed) {
            // Empêche la connexion si connecté
            return res.json({ message: "Vous êtes déjà connecté." });
        }

        // Vérifier si l'utilisateur existe avec les détails du rôle
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, attributes: ['title'] }]
        });

        if (!user) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        // Vérifier le mot de passe
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        // Générer un token JWT pour l'utilisateur
        const token = generateToken(user.id);

        // Ne pas renvoyer le mot de passe dans la réponse
        const userWithoutPassword = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.Role.title,  // Afficher le nom du rôle au lieu de l'ID
        };

        res.status(200).json({ message: "Connexion effectuée avec succès", token, user: userWithoutPassword });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Vérifier le token
router.get('/test-token', ADMINauthenticationMiddleware, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { id: decoded.id } });

        if (!user) {
            return res.status(400).send("Utilisateur introuvable");
        }

        res.json({ id: decoded.id, results: { username: user.username, roleId: user.RoleId } });
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        res.status(401).json({ message: 'Token invalide' });
    }
});

module.exports = router;
