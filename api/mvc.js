const { home } = require('../controllers/homeController');

module.exports = function mvcHandler(req, res) {
  return home(req, res);
};
