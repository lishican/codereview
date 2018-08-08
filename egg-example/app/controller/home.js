'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.app.logger.debug('debug info');
    this.ctx.body = 'hi, egg22';
  }
}

module.exports = HomeController;
