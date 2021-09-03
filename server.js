const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

//process.env.DATABASE.replace('<username>', process.env.DATABASE.USER);
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('succesful connection');
  });

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(` the app is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  server.close(() => {
    console.log(err.name, err.message);
    process.exit(1);
  });
});
