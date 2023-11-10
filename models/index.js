const sequelize = require('./_database');

// Importation des models
const Product = require('./Product');
const Tag = require('./Tag');
const Role = require('./Role');
const User = require('./User');

// Déclaration des relations
Product.belongsToMany(Tag, { through: 'ProductTag'});
Tag.belongsToMany(Product, { through: 'ProductTag'});

// Synchronisation de la base
sequelize.sync({alter: true});


module.exports = {
    Product: Product,
    Tag: Tag,
    Role: Role,
    User: User,
}
