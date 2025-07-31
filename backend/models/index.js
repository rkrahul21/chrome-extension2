const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

const Profile = sequelize.define('Profile', {
  name: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  about: { type: DataTypes.TEXT },
  bio: { type: DataTypes.TEXT },
  bioLine: { type: DataTypes.STRING }, 
  location: { type: DataTypes.STRING },
  followerCount: { type: DataTypes.INTEGER },
  connectionCount: { type: DataTypes.INTEGER }
});

module.exports = { sequelize, Profile };
