module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'd2_meetup',
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true,
  },
};
