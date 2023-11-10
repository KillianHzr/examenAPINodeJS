var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
const { authenticationMiddleware, ADMINauthenticationMiddleware } = require('../middlewares/auth');

// Importation des modèles Sequelize.
const { Product, Tag } = require('../models');

// Lister les produits
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const { count, rows: products } = await Product.findAndCountAll({
            where: {
                references: {
                    [Op.gt]: 0
                }
            },
            limit: pageSize,
            offset: (page - 1) * pageSize,
            include: Tag,
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

// Récupérer tous les produits avec filtre par tags
router.get('/filtered', async (req, res) => {
    try {
        const { tags } = req.query;

        if (!tags) {
            return res.status(400).json({ message: 'Les tags sont requis pour filtrer les produits.' });
        }

        const tagArray = tags.split(',');

        const products = await Product.findAll({
            include: [{
                model: Tag,
                where: { title: { [Op.in]: tagArray } },
                through: { attributes: [] },
            }],
        });

        res.json(products);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits filtrés :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des produits filtrés' });
    }
});

// Afficher un produit
router.get('/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    try {
        if (productId) {
            const productWithTags = await Product.findByPk(productId, {
                include: Tag,
            });

            res.status(200).json(productWithTags);
        } else {
            res.status(404).json({ message: 'Produit non trouvé' });
        }
    } catch (error) {
        console.log("Erreur lors de la récupération du produit depuis la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du produit" });
    }
});

// Ajouter un produit
router.post('/', ADMINauthenticationMiddleware, async (req, res) => {
    try {
        const { title, prix, description, references, tags } = req.body;

        const tagsExistants = await Tag.findAll({
            where: {
                title: {
                    [Op.in]: tags
                }
            }
        });

        const nonTagsExistants = tags.filter(tag => !tagsExistants.some(existingTag => existingTag.title === tag));
        if (nonTagsExistants.length > 0) {
            return res.status(400).json({ error: `Les tags suivants n'existent pas : ${nonTagsExistants.join(', ')}` });
        }

        const createdProduct = await Product.create({
            title,
            prix,
            description,
            references
        });

        await createdProduct.addTags(tagsExistants);

        const productWithTags = await Product.findByPk(createdProduct.id, {
            include: Tag,
        });

        res.status(201).json(productWithTags);
    } catch (error) {
        console.log("Erreur lors de l'insertion du produit dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la création du produit" });
    }
});

// Mettre à jour un produit
router.patch('/:id', ADMINauthenticationMiddleware, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const updatedFields = req.body;

        const existingProduct = await Product.findByPk(productId);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        await existingProduct.update(updatedFields);

        if (updatedFields.tags) {
            const existingTags = await Tag.findAll({
                where: {
                    title: {
                        [Op.in]: updatedFields.tags
                    }
                }
            });

            const nonExistingTags = updatedFields.tags.filter(tag => !existingTags.some(existingTag => existingTag.title === tag));
            if (nonExistingTags.length > 0) {
                return res.status(400).json({ error: `Les tags suivants n'existent pas : ${nonExistingTags.join(', ')}` });
            }

            await existingProduct.removeTags();
            await existingProduct.addTags(existingTags);
        }

        const updatedProduct = await Product.findByPk(productId, {
            include: Tag
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.log("Erreur lors de la mise à jour du produit dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du produit" });
    }
});

// Supprimer un produit
router.delete('/:id', ADMINauthenticationMiddleware, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        const existingProduct = await Product.findByPk(productId);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        await existingProduct.destroy();

        res.status(200).json({ message: 'Produit supprimé' });
    } catch (error) {
        console.log("Erreur lors de la suppression du produit dans la base de données:", error);
        res.status(500).json({ error: "Erreur lors de la suppression du produit" });
    }
});

// Exporter le routeur pour utilisation dans d'autres fichiers
module.exports = router;