
require('dotenv').config();
const express = require('express');
const { sequelize, Profile } = require('./models');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/profiles', async (req, res) => {
  try {
    const { name, url, about, bio, location, followerCount, connectionCount, bioLine } = req.body;
    const profile = await Profile.create({ name, url, about, bio, location, followerCount, connectionCount, bioLine });
    res.status(201).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
