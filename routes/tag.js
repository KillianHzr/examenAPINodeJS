var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
const { Tag } = require('../models');

// Lister les tags
router.get('/', async (req, res) =>{
    try {
        const tags = await Tag.findAll();
        res.status(200).json(tags);
    } catch (error) {
        console.log("Erreur lors de la récupération des tags depuis la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des tags" });
    }
});

// Afficher un tag
router.get('/:id', async (req, res) => {
    const tagId = parseInt(req.params.id);

    try {
        const tag = await Tag.findByPk(tagId);

        if (tag) {
            res.status(200).json(tag);
        } else {
            res.status(404).json({ message: 'Tag non trouvé' });
        }
    } catch (error) {
        console.log("Erreur lors de la récupération du tag depuis la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du tag" });
    }
});

// Ajouter un tag
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;

        const createdTag = await Tag.create({ title });

        res.status(201).json(createdTag);
    } catch (error) {
        console.log("Erreur lors de l'insertion du tag dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la création du tag" });
    }
});

// Mettre à jour un tag
router.patch('/:id', async (req, res) => {
    try {
        const tagId = parseInt(req.params.id);
        const updatedFields = req.body;

        const existingTag = await Tag.findByPk(tagId);

        if (!existingTag) {
            return res.status(404).json({ error: 'Tag non trouvé' });
        }

        await existingTag.update(updatedFields);

        const updatedTag = await Tag.findByPk(tagId);

        res.status(200).json(updatedTag);
    } catch (error) {
        console.log("Erreur lors de la mise à jour du tag dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du tag" });
    }
});

// Supprimer un tag
router.delete('/:id', async (req, res) => {
    try {
        const tagId = parseInt(req.params.id);

        const existingTag = await Tag.findByPk(tagId);

        if (!existingTag) {
            return res.status(404).json({ error: 'Tag non trouvé' });
        }

        await existingTag.destroy();

        res.status(200).json({ message: 'Tag supprimé' });
    } catch (error) {
        console.log("Erreur lors de la suppression du tag dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la suppression du tag" });
    }
});

// Exporter le routeur pour utilisation dans d'autres fichiers
module.exports = router;
