var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
// Importation d'un modèle Sequelize dans une vue.
// Par défaut, require ira chercher le fichier index.js
const { Product } = require('../models');

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
router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;
        const createdProduct = Product.create(newProduct);
  
        res.status(201).json(createdProduct);
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



module.exports = router;