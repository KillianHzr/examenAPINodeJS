const sequelize = require('./_database');
const { DataTypes } = require('sequelize');

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    indexes: [
        {unique: true, fields: ['title']},
    ]
})

module.exports = Tag