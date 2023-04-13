const { Pool } = require("pg");
const autoBind = require("auto-bind");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
    autoBind(this);
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlists VALUES($1,$2,$3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getPlaylist(owner) {
    const query = {
      text: "SELECT playlists.id as id,name,username FROM playlists LEFT JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1",
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: "SELECT playlists.id as id,name,username FROM playlists LEFT JOIN users ON playlists.owner = users.id WHERE playlists.id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }

  async addPlaylistSong() {
    this._playslistSongs;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  // async addPlaylistSong(playlistId, songId) {
  //   const id = nanoid(16);

  //   const query = {
  //     text: "INSERT INTO playlists_song VALUES($1,$2,$3) RETURNING id",
  //     values: [id, playlistId, songId],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rows[0].id) {
  //     throw new InvariantError("Lagu gagal ditambahkan");
  //   }

  //   return result.rows[0].id;
  // }

  async verifyPlaylistAccess(id, owner) {
    try {
      await this.verifyPlaylistOwner(id, owner);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw error;
      // try {
      //   await this._collaborationService.verifyCollaborator(id, username);
      // } catch {
      //   throw error;
      // }
    }
  }
}

module.exports = PlaylistsService;
