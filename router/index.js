const express = require('express');
const router = express.Router();

const usersController = require('../controllers/Users.Controller');

/* 고객 */
router.post('/users/token', usersController.token);
router.post('/users/refresh', usersController.refresh);
router.post('/users/logout', usersController.logout);

module.exports = router;