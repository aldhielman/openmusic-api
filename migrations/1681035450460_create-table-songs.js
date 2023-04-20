/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
      default: null, // Set default value to null
      allowNull: true,
    },
    albumId: {
      type: 'VARCHAR(50)',
      default: null, // Set default value to null
      notNull: false,
    },
  });

  pgm.addConstraint('songs', 'fk_songs_albumId', {
    foreignKeys: {
      columns: 'albumId', // Correct column name
      references: 'albums(id)', // Reference the 'id' column in the 'albums' table
      onDelete: 'CASCADE', // Optional: specify the onDelete action
      onUpdate: 'CASCADE', // Optional: specify the onUpdate action
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs_album-id');
  pgm.dropTable('songs');
};
