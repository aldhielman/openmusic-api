const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumSongsDBToModel, mapAlbumWithSongToModel } = require('../../utils');

class SongsService {
  constructor() {
    this.pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this.pool.query('SELECT * FROM albums');
    return result.rows;
  }

  async getAlbumById(id) {
    const albumsQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const albums = await this.pool.query(albumsQuery);

    const songsQuery = {
      text: 'SELECT * FROM songs WHERE "albumId" = $1',
      values: [id],
    };
    const songs = await this.pool.query(songsQuery);

    if (!albums.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    albums.rows[0].songs = songs.rows.map(mapAlbumSongsDBToModel);

    return albums.rows.map(mapAlbumWithSongToModel)[0];
  }

  async editAlbumById(id, { name, year, coverUrl }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, "coverUrl" = $3 WHERE id = $4 RETURNING id',
      values: [name, year, coverUrl, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
