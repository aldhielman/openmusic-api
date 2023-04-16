/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn("albums", {
    cover_url: { type: "text", notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("albums", "cover_url");
};
