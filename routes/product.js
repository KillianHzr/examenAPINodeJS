var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');

// Importation des modèles Sequelize.
const { Product } = require('../models');
const { Tag } = require('../models');

// Lister les produits
router.get('/', async (req, res) =>{
    try {
        // Récupérer la page et la taille de la page depuis les paramètres de requête.
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Récupérer les produits avec du stock paginés
        const { count, rows: products } = await Product.findAndCountAll({
            where: {
                references: {
                    [Op.gt]: 0
                }
            },
            limit: pageSize,
            offset: (page - 1) * pageSize,
        });

        // Créer la réponse avec les détails de pagination
        const response = {
            count,
            currentPage: page,
            totalPages: Math.ceil(count / pageSize),
            results: products,
        };

        // Renvoyer la réponse au format JSON
        res.status(200).json(response);
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de la récupération des produits depuis la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des produits" });
    }
});

// Afficher un produit
router.get('/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    try {
        // Récupérer le produit par son identifiant
        const product = await Product.findByPk(productId);

        // Vérifier si le produit existe et le renvoyer au format JSON
        if (product) {
            res.status(200).json(product);
        } else {
            // Renvoyer une réponse 404 si le produit n'est pas trouvé
            res.status(404).json({ message: 'Produit non trouvé' });
        }
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de la récupération du produit depuis la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du produit" });
    }
});

// Ajouter un produit
router.post('/', async (req, res) => {
    try {
        // Récupérer les données du corps de la requête
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

        // Renvoyer le produit créé au format JSON
        res.status(201).json(productWithTags);
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de l'insertion du produit dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la création du produit" });
    }
});

// Mettre à jour un produit
router.patch('/:id', async (req, res) => {
    try {
        // Récupérer l'identifiant du produit et les champs mis à jour depuis les paramètres
        const productId = parseInt(req.params.id);
        const updatedFields = req.body;

        // Vérifier si le produit existe
        const existingProduct = await Product.findByPk(productId);

        // Renvoyer une réponse 404 si le produit n'est pas trouvé
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

        // Renvoyer le produit mis à jour avec les tags au format JSON
        const updatedProduct = await Product.findByPk(productId, {
            include: Tag
        });

        // Renvoyer le produit mis à jour au format JSON
        res.status(200).json(updatedProduct);
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de la mise à jour du produit dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du produit" });
    }
});

// Supprimer un produit
router.delete('/:id', async (req, res) => {
    try {
        // Récupérer l'identifiant du produit depuis les paramètres de requête
        const productId = parseInt(req.params.id);

        // Vérifier si le produit existe
        const existingProduct = await Product.findByPk(productId);

        // Renvoyer une réponse 404 si le produit n'est pas trouvé
        if (!existingProduct) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        // Supprimer le produit
        await existingProduct.destroy();

        // Renvoyer un message de succès au format JSON
        res.status(200).json({ message: 'Produit supprimé' });
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur au format JSON
        console.log("Erreur lors de la suppression du produit dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la suppression du produit" });
    }
});

// Exporter le routeur pour utilisation dans d'autres fichiers
module.exports = router;