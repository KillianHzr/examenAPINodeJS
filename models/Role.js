const sequelize = require('./_database');
const { DataTypes } = require('sequelize');

const Role = sequelize.define('Role', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    indexes: [
        {unique: true, fields: ['title']},
    ]
});

module.exports = Role;
