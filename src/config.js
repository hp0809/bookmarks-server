module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_TOKEN: process.env.API_TOKEN || '123456789',
  DB_URL: process.env.DB_URL || 'postgresql://dunder-mifflin:dunder@localhost/bookmarks',
}