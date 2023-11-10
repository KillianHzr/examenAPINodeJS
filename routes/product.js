var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
// Importation d'un modèle Sequelize dans une vue.
// Par défaut, require ira chercher le fichier index.js
const { Product } = require('../models');
const { Tag } = require('../models');

// Lister les produit
router.get('/', async (req, res) =>{
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const { count, rows: products } = await Product.findAndCountAll({
            // Afficher uniquement les produits avec du stock
            where: {
                references: {
                    [Op.gt]: 0
                }
            },
            limit: pageSize,
            offset: (page - 1) * pageSize,
        });
        const response = {
            count,
            currentPage: page,
            totalPages: Math.ceil(count / pageSize),
            results: products,
        };
        res.status(200).json(response);
    } catch (error) {
        console.log("Erreur lors de la récupération des produits depuis la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des produits" });
    }
});

// Ajouter un produit
// Ajouter un produit
router.post('/', async (req, res) => {
    try {
        const { title, prix, description, references, tags } = req.body;

        // Vérifier si les tags existent
        const tagsExistants = await Tag.findAll({
            where: {
                title: {
                    [Op.in]: tags
                }
            }
        });

        // Si des tags n'existent pas, renvoyer un message d'erreur
        const nonTagsExistants = tags.filter(tag => !tagsExistants.some(existingTag => existingTag.title === tag));
        if (nonTagsExistants.length > 0) {
            return res.status(400).json({ error: `Les tags suivants n'existent pas : ${nonTagsExistants.join(', ')}` });
        }

        // Créer le produit
        const createdProduct = await Product.create({
            title,
            prix,
            description,
            references
        });

        // Associer les tags existants au produit
        await createdProduct.addTags(tagsExistants);

        // Récupérer le produit avec les tags pour la réponse
        const productWithTags = await Product.findByPk(createdProduct.id, {
            include: Tag,
        });

        res.status(201).json(productWithTags);
    } catch (error) {
        console.log("Erreur lors de l'insertion du produit dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la création du produit" });
    }
});


// Afficher un produit
router.get('/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    try {
        const product = await Product.findByPk(productId);

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Produit non trouvée' });
        }
    } catch (error) {
        console.log("Erreur lors de la récupération du produit depuis la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du produit" });
    }
});

// Mettre à jour un produit
router.patch('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const updatedFields = req.body;

        // Vérifier si le produit existe
        const existingProduct = await Product.findByPk(productId);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        // Mettre à jour les champs du produit
        await existingProduct.update(updatedFields);

        // Vérifier si des tags ont été fournis dans la requête
        if (updatedFields.tags) {
            // Vérifier si les tags existent
            const existingTags = await Tag.findAll({
                where: {
                    title: {
                        [Op.in]: updatedFields.tags
                    }
                }
            });

            // Si des tags n'existent pas, renvoyer un message d'erreur
            const nonExistingTags = updatedFields.tags.filter(tag => !existingTags.some(existingTag => existingTag.title === tag));
            if (nonExistingTags.length > 0) {
                return res.status(400).json({ error: `Les tags suivants n'existent pas : ${nonExistingTags.join(', ')}` });
            }

            // Retirer les anciens tags associés au produit
            await existingProduct.removeTags();

            // Ajouter les nouveaux tags au produit
            await existingProduct.addTags(existingTags);
        }

        // Renvoyer le produit mis à jour
        const updatedProduct = await Product.findByPk(productId, {
            include: Tag  // Inclure les tags dans la réponse
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.log("Erreur lors de la mise à jour du produit dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du produit" });
    }
});

// Supprimer un produit
router.delete('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        // Vérifier si le produit existe
        const existingProduct = await Product.findByPk(productId);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        // Supprimer le produit
        await existingProduct.destroy();

        res.status(200).json({ message: 'Produit supprimé' });
    } catch (error) {
        console.log("Erreur lors de la suppression du produit dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la suppression du produit" });
    }
});



module.exports = router;