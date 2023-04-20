const config = {
  server: {
    host: process.env.SERVER,
    port: process.env.PORT,
  },
  postgres: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
  rabbitmq: {
    server: process.env.RABBITMQ_SERVER,
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESSS_KEY_ID,
    secreteAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  redis: {
    server: process.env.REDIS_SERVER,
  },
};

module.exports = config;
