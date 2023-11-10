var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
const { authenticationMiddleware, ADMINauthenticationMiddleware } = require('../middlewares/auth');

// Importation des modèles Sequelize.
const { Product, Tag, User } = require('../models');

// Lister les produits
// Filter avec ?tags=tag,tag,tag
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

        // Si des tags sont fournis dans la requête, appliquer le filtre
        if (req.query.tags) {
            const tagArray = req.query.tags.split(',');
            const filteredProducts = await Product.findAll({
                include: [{
                    model: Tag,
                    where: { title: { [Op.in]: tagArray } },
                    through: { attributes: [] },
                }],
            });
            return res.status(200).json({
                count: filteredProducts.length,
                currentPage: page,
                totalPages: Math.ceil(filteredProducts.length / pageSize),
                results: filteredProducts,
            });
        }

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



//  todo - PANIER
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------
//  PAS FONCTIONNEL
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------

// Route pour ajouter un produit au panier
// router.post('/add-to-cart/:productId', authenticationMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.id;

//         // Vérifiez si l'utilisateur a déjà un panier
//         const user = await User.findByPk(userId, { include: 'cart' });

//         let cart;
//         if (user.cart) {
//             // Utilisez le panier existant
//             cart = user.cart;
//         } else {
//             // Créez un nouveau panier
//             cart = await Cart.create();
//             // Associez le panier à l'utilisateur
//             await user.setCart(cart);
//         }

//         // À ce stade, vous avez le panier dans la variable 'cart'
//         // Vous pouvez ajouter le produit au panier comme vous le faisiez auparavant.
//         // Assurez-vous d'avoir une association entre 'Product' et 'Cart' pour le faire.

//         const productId = req.params.productId;
//         const quantity = req.body.quantity || 1;

//         const product = await Product.findByPk(productId);

//         if (product) {
//             // Ajoutez le produit au panier
//             await cart.addProduct(product, { through: { quantity } });
//             res.status(200).json({ message: 'Produit ajouté au panier avec succès.' });
//         } else {
//             res.status(404).json({ message: 'Produit non trouvé.' });
//         }
//     } catch (error) {
//         console.error('Erreur lors de l\'ajout au panier :', error);
//         res.status(500).json({ message: 'Erreur lors de l\'ajout au panier.' });
//     }
// });




// Exporter le routeur pour utilisation dans d'autres fichiers
module.exports = router;