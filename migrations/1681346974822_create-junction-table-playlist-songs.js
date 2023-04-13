/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint(
    "playlist_songs",
    "unique-playlist_songs-playlist_id-song_id",
    "UNIQUE(playlist_id, song_id)"
  );

  pgm.addConstraint("playlist_songs", "fk-playlist_songs-playlist_id", {
    foreignKeys: {
      columns: "playlist_id", // Correct column name
      references: "playlists(id)", // Reference the 'id' column in the 'users' table
      onDelete: "CASCADE", // Optional: specify the onDelete action
      onUpdate: "CASCADE", // Optional: specify the onUpdate action
    },
  });

  pgm.addConstraint("playlist_songs", "fk-playlist_songs-song_id", {
    foreignKeys: {
      columns: "song_id", // Correct column name
      references: "songs(id)", // Reference the 'id' column in the 'users' table
      onDelete: "CASCADE", // Optional: specify the onDelete action
      onUpdate: "CASCADE", // Optional: specify the onUpdate action
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("playlist_songs", "fk-playlist_songs-song_id");
  pgm.dropConstraint("playlist_songs", "fk-playlist_songs-playlist_id");
  pgm.dropConstraint(
    "playlist_songs",
    "unique-playlist_songs-playlist_id-song_id"
  );
  pgm.dropTable("playlists");
};
