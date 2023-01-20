'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('todos')
      .service('myService')
      .getWelcomeMessage();
  },
};
