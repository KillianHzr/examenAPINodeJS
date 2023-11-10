// var express = require('express');
// var router = express.Router();
// const { Op } = require('sequelize');
// const { authenticationMiddleware, ADMINauthenticationMiddleware } = require('../middlewares/auth');

// // Importation des modèles Sequelize.
// const { Product, Tag, Order } = require('../models');

// // Valider le panier et créer une commande
// router.post('/validate-cart', authenticationMiddleware, async (req, res) => {
//     try {
//         const { address } = req.body;

//         // Récupérer le panier temporaire de l'utilisateur
//         const userCart = req.session.cart || [];

//         // Créer une commande associée au panier
//         const createdOrder = await Order.create({
//             userId: req.user.id,
//             address,
//             items: userCart,
//         });

//         // Mettre à jour le stock des produits (à implémenter)

//         // Vider le panier après validation
//         req.session.cart = [];

//         res.status(200).json({ message: 'Commande validée avec succès' });
//     } catch (error) {
//         console.error('Erreur lors de la validation du panier :', error);
//         res.status(500).json({ error: 'Erreur lors de la validation du panier' });
//     }
// });

// // Consulter toutes les commandes de l'utilisateur
// router.get('/user-orders', authenticationMiddleware, async (req, res) => {
//     try {
//         const userOrders = await Order.findAll({
//             where: {
//                 userId: req.user.id,
//             },
//         });

//         res.status(200).json(userOrders);
//     } catch (error) {
//         console.error('Erreur lors de la récupération des commandes de l\'utilisateur :', error);
//         res.status(500).json({ error: 'Erreur lors de la récupération des commandes de l\'utilisateur' });
//     }
// });

// // Autres routes liées aux commandes (à ajouter au besoin)

// module.exports = router;
