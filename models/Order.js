// const sequelize = require('./_database');
// const { DataTypes } = require('sequelize');
// const Product = require('./Product');

// const Order = sequelize.define('Order', {
//     id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     userId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     address: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     productCount: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//     },
//     totalPrice: {
//         type: DataTypes.FLOAT,
//         defaultValue: 0.0,
//     },
// }, {
//     indexes: [
//         { unique: true, fields: ['userId', 'id'] },
//     ],
// });

// module.exports = Order;
