const sequelize = require('./_database');
const { DataTypes } = require('sequelize');

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    indexes: [
        {unique: true, fields: ['name']},
    ]
})

module.exports = Tag