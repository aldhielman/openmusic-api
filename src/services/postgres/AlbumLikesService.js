const autoBind = require("auto-bind");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { nanoid } = require("nanoid");

class AlbumLikesService {
  constructor() {
    this._pool = new Pool();

    autoBind(this);
  }

  async addLike(albumId, userId) {
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Like gagal ditambahkan");
    }
    return result.rows[0].id;
  }

  async deleteLikeById(albumId, userId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id",
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Like gagal dihapus. Id tidak ditemukan");
    }
  }

  async getLikes(albumId) {
    const query = {
      text: "SELECT COUNT(*) AS like FROM user_album_likes WHERE album_id = $1",
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return Number(result.rows[0].like);
  }

  async verifyDuplicate(albumId, userId) {
    const query = {
      text: "SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2",
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);
    if (result.rows.length) {
      throw new InvariantError("Album tersebut sudah pernah anda like");
    }
  }
}

module.exports = AlbumLikesService;
