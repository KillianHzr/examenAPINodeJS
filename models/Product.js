const sequelize = require('./_database');
const { DataTypes } = require('sequelize');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prix: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    references: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
    }
});

// Exporter le modèle pour utilisation dans d'autres fichiers
module.exports = Product;
