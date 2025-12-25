require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const circleRoutes = require('./routes/circle');
const dashboardRoutes = require('./routes/dashboard');
const db = require('./utils/db');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/circle', circleRoutes);
app.use('/dashboard', dashboardRoutes);

// error handling middleware, must be last
app.use((err, req, res, next) => {
  // console.error(`ERROR [${req.method} ${req.originalUrl}]:`, err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    route: `${req.method} ${req.path}`,
    message: err.message
  });
});

// launch the server only if this file is directly launch
// use to not start the api server during unitary tests
if (require.main === module) {
  db.connect()
    .then(async () => {
      app.listen(process.env.API_PORT, () => {
        console.log(`INFO : Server running on port ${process.env.API_PORT}`);
      });
    })
    .catch((err) => {
      console.error('INFO : Failed to start server:', err.message);
      process.exit(1);
    });
}

module.exports = app;
