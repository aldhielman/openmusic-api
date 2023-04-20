const autoBind = require('auto-bind');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikesService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;

    autoBind(this);
  }

  async addLike(albumId, userId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this.cacheService.delete(`album-likes:${albumId}`);

    return result.rows[0].id;
  }

  async deleteLikeById(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan');
    }

    await this.cacheService.delete(`album-likes:${albumId}`);
  }

  async getLikes(albumId) {
    try {
      const result = await this.cacheService.get(`album-likes:${albumId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) AS like FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this.pool.query(query);

      const likes = { count: Number(result.rows[0].like), cache: false };

      await this.cacheService.set(
        `album-likes:${albumId}`,
        JSON.stringify({ ...likes, cache: true }),
      );

      return likes;
    }
  }

  async verifyDuplicate(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const result = await this.pool.query(query);
    if (result.rows.length) {
      throw new InvariantError('Album tersebut sudah pernah anda like');
    }
  }
}

module.exports = AlbumLikesService;
