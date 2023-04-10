const mapSongDBToModel = (s) => ({
  id: s.id,
  title: s.title,
  year: s.year,
  performer: s.performer,
  genre: s.genre,
  duration: s.duration,
  albumId: s.album_id,
});

module.exports = { mapSongDBToModel };
