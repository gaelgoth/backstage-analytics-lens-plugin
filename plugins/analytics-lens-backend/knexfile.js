module.exports = {
  client: 'better-sqlite3',
  connection: ':memory:',
  useNullAsDefault: true,
  migrations: {
    directory: './migrations',
  },
};
