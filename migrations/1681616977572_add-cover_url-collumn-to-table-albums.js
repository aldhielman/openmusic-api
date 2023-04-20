/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('albums', {
    coverUrl: { type: 'text', notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'coverUrl');
};
