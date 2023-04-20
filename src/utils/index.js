const mapSongsDBToModel = ({
  id, title, year, performer, genre, duration, albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

const mapAlbumSongsDBToModel = ({ id, title, performer }) => ({ id, title, performer });

const mapAlbumWithSongToModel = ({
  id, name, year, coverUrl, songs,
}) => ({
  id, name, year, coverUrl, songs,
});

const mapPlaylistSongsToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

module.exports = {
  mapSongsDBToModel, mapAlbumSongsDBToModel, mapAlbumWithSongToModel, mapPlaylistSongsToModel,
};
