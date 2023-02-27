const usersService = require('../services/Users.Service');

module.exports = {
  token,
  refresh,
  logout
};

function token(req, res, next) {
  usersService.token(req.body, req, res)
    .then(user => res.json(user));
}

function refresh(req, res, next) { 
  usersService.refresh(req, res)
    .then(user => res.json(user));
}

function logout(req, res, next) {
  usersService.logout(req, res)
    .then(user => res.json(user));
}

// catch에 대한 예시 유지
/*
function getAll(req, res, next) {
  usersService.getAll()
    .then(users => res.json(users))
    .catch(next);
}
*/
