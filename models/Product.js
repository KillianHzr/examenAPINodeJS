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
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    references: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tags: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

module.exports = Product