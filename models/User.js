const sequelize = require('./_database');
const { DataTypes } = require('sequelize');
const Role = require('./Role');
// const Cart = require('./Cart');

const User = sequelize.define('User', {
    // Autres colonnes de votre modèle User
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    RoleId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    indexes: [
        {unique: true, fields: ['username', 'email']},
    ]
});

// Relation avec le modèle de rôle
User.belongsTo(Role, { foreignKey: 'RoleId' });
// User.hasOne(Cart);

module.exports = User;
