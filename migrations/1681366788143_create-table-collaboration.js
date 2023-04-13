/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat table collaborations
  pgm.createTable("collaborations", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  /*
        Menambahkan constraint UNIQUE, kombinasi dari kolom playlist_id dan user_id.
        Guna menghindari duplikasi data antara nilai keduanya.
      */
  pgm.addConstraint(
    "collaborations",
    "unique-collaborations-playlist_id-and_user_id",
    "UNIQUE(playlist_id, user_id)"
  );

  // memberikan constraint foreign key pada kolom playlist_id dan user_id terhadap playlists.id dan users.id
  pgm.addConstraint("collaborations", "fk-collaborations-playlist_id", {
    foreignKeys: {
      columns: "playlist_id", // Correct column name
      references: "playlists(id)", // Reference the 'id' column in the 'users' table
      onDelete: "CASCADE", // Optional: specify the onDelete action
      onUpdate: "CASCADE", // Optional: specify the onUpdate action
    },
  });
  pgm.addConstraint("collaborations", "fk-collaborations-user_id", {
    foreignKeys: {
      columns: "user_id", // Correct column name
      references: "users(id)", // Reference the 'id' column in the 'users' table
      onDelete: "CASCADE", // Optional: specify the onDelete action
      onUpdate: "CASCADE", // Optional: specify the onUpdate action
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("collaborations", "fk-collaborations-user_id");
  pgm.dropConstraint("collaborations", "fk-collaborations-playlist_id");
  pgm.dropConstraint(
    "collaborations",
    "unique-collaborations-playlist_id-and_user_id"
  );
  // menghapus tabel collaborations
  pgm.dropTable("collaborations");
};
