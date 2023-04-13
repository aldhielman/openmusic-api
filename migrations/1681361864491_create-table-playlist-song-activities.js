/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("playlist_song_activities", {
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
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    action: {
      type: "TEXT",
      notNull: true,
    },
    time: {
      type: "TEXT",
      notNull: true,
    },
  });

  pgm.addConstraint(
    "playlist_song_activities",
    "fk-playlist_songs_activities-song_id",
    {
      foreignKeys: {
        columns: "song_id", // Correct column name
        references: "songs(id)", // Reference the 'id' column in the 'users' table
        onDelete: "CASCADE", // Optional: specify the onDelete action
        onUpdate: "CASCADE", // Optional: specify the onUpdate action
      },
    }
  );

  pgm.addConstraint(
    "playlist_song_activities",
    "fk-playlist_songs_activities-playlist_id",
    {
      foreignKeys: {
        columns: "playlist_id", // Correct column name
        references: "playlists(id)", // Reference the 'id' column in the 'users' table
        onDelete: "CASCADE", // Optional: specify the onDelete action
        onUpdate: "CASCADE", // Optional: specify the onUpdate action
      },
    }
  );

  pgm.addConstraint(
    "playlist_song_activities",
    "fk-playlist_songs_activities-user_id",
    {
      foreignKeys: {
        columns: "user_id", // Correct column name
        references: "users(id)", // Reference the 'id' column in the 'users' table
        onDelete: "CASCADE", // Optional: specify the onDelete action
        onUpdate: "CASCADE", // Optional: specify the onUpdate action
      },
    }
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    "playlist_song_activities",
    "fk-playlist_songs_activities-user_id"
  );
  pgm.dropConstraint(
    "playlist_song_activities",
    "fk-playlist_songs_activities-playlist_id"
  );
  pgm.dropConstraint(
    "playlist_song_activities",
    "fk-playlist_songs_activities-song_id"
  );
  pgm.dropTable("playlist_song_activities");
};
