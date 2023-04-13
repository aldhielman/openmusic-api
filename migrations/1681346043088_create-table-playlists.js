/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("playlists", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    name: {
      type: "TEXT",
      notNull: true,
    },
    owner: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint("playlists", "fk_playlist_owner", {
    foreignKeys: {
      columns: "owner", // Correct column name
      references: "users(id)", // Reference the 'id' column in the 'users' table
      onDelete: "CASCADE", // Optional: specify the onDelete action
      onUpdate: "CASCADE", // Optional: specify the onUpdate action
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("playlists", "fk_playlists_owner");
  pgm.dropTable("playlists");
};
