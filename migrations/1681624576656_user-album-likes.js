/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("user_album_likes", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint(
    "user_album_likes",
    "unique-user_album_likes-album_id-and_user_id",
    "UNIQUE(album_id, user_id)"
  );

  // memberikan constraint foreign key pada kolom album_id dan user_id terhadap albums.id dan users.id
  pgm.addConstraint("user_album_likes", "fk-user_album_likes-album_id", {
    foreignKeys: {
      columns: "album_id", // Correct column name
      references: "albums(id)", // Reference the 'id' column in the 'users' table
      onDelete: "CASCADE", // Optional: specify the onDelete action
      onUpdate: "CASCADE", // Optional: specify the onUpdate action
    },
  });
  pgm.addConstraint("user_album_likes", "fk-user_album_likes-user_id", {
    foreignKeys: {
      columns: "user_id", // Correct column name
      references: "users(id)", // Reference the 'id' column in the 'users' table
      onDelete: "CASCADE", // Optional: specify the onDelete action
      onUpdate: "CASCADE", // Optional: specify the onUpdate action
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("user_album_likes", "fk-user_album_likes-user_id");
  pgm.dropConstraint("user_album_likes", "fk-user_album_likes-playlist_id");
  pgm.dropConstraint(
    "user_album_likes",
    "unique-user_album_likes-playlist_id-and_user_id"
  );
  // menghapus tabel user_album_likes
  pgm.dropTable("user_album_likes");
};
