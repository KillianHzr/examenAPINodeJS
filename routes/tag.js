var express = require('express');
var router = express.Router();
const { authenticationMiddleware, ADMINauthenticationMiddleware } = require('../middlewares/auth');

// Importation des modèles Sequelize.
const { Tag } = require('../models');

// Lister les tags
router.get('/', ADMINauthenticationMiddleware, async (req, res) =>{
    try {
        // Récupérer tous les tags depuis la base de données
        const tags = await Tag.findAll();
        
        // Renvoyer la liste des tags au format JSON
        res.status(200).json(tags);
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de la récupération des tags depuis la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des tags" });
    }
});

// Afficher un tag
router.get('/:id', ADMINauthenticationMiddleware, async (req, res) => {
    const tagId = parseInt(req.params.id);

    try {
        // Récupérer un tag spécifique par son identifiant
        const tag = await Tag.findByPk(tagId);

        // Vérifier si le tag existe et le renvoyer au format JSON
        if (tag) {
            res.status(200).json(tag);
        } else {
            // Renvoyer une réponse 404 si le tag n'est pas trouvé
            res.status(404).json({ message: 'Tag non trouvé' });
        }
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de la récupération du tag depuis la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du tag" });
    }
});

// Ajouter un tag
router.post('/', ADMINauthenticationMiddleware, async (req, res) => {
    try {
        // Récupérer le titre du tag depuis le corps de la requête
        const { title } = req.body;

        // Créer un nouveau tag dans la base de données
        const createdTag = await Tag.create({ title });

        // Renvoyer le tag créé au format JSON
        res.status(201).json(createdTag);
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de l'insertion du tag dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la création du tag" });
    }
});

// Mettre à jour un tag
router.patch('/:id', ADMINauthenticationMiddleware, async (req, res) => {
    try {
        // Récupérer l'identifiant du tag et les champs mis à jour depuis les paramètres
        const tagId = parseInt(req.params.id);
        const updatedFields = req.body;

        // Vérifier si le tag existe
        const existingTag = await Tag.findByPk(tagId);

        // Renvoyer une réponse 404 si le tag n'est pas trouvé
        if (!existingTag) {
            return res.status(404).json({ error: 'Tag non trouvé' });
        }

        // Mettre à jour les champs du tag
        await existingTag.update(updatedFields);

        // Renvoyer le tag mis à jour au format JSON
        const updatedTag = await Tag.findByPk(tagId);
        res.status(200).json(updatedTag);
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de la mise à jour du tag dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du tag" });
    }
});

// Supprimer un tag
router.delete('/:id', ADMINauthenticationMiddleware, async (req, res) => {
    try {
        // Récupérer l'identifiant du tag depuis les paramètres de requête
        const tagId = parseInt(req.params.id);

        // Vérifier si le tag existe
        const existingTag = await Tag.findByPk(tagId);

        // Renvoyer une réponse 404 si le tag n'est pas trouvé
        if (!existingTag) {
            return res.status(404).json({ error: 'Tag non trouvé' });
        }

        // Supprimer le tag de la base de données
        await existingTag.destroy();

        // Renvoyer un message de succès au format JSON
        res.status(200).json({ message: 'Tag supprimé' });
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de la suppression du tag dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la suppression du tag" });
    }
});

// Exporter le routeur pour utilisation dans d'autres fichiers
module.exports = router;
