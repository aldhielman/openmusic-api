const { Pool } = require('pg')
const autoBind = require('auto-bind')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class PlaylistSongsService {
  constructor (playlistService) {
    this._pool = new Pool()
    this._playlistService = playlistService
    autoBind(this)
  }

  async addPlaylistSong (playlistId, songId) {
    const id = nanoid(16)

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }
  }

  async deletePlaylistSongById (playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError(
        'Lagu didalam Playlist gagal dihapus. Resource tidak ditemukan'
      )
    }
  }

  async getPlaylistSongs (playlistId) {
    const playlist = await this._playlistService.getPlaylistById(playlistId)
    const query = {
      text: 'SELECT * FROM playlist_songs LEFT JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_id = $1',
      values: [playlistId]
    }
    const result = await this._pool.query(query)
    playlist.songs = result.rows.map(({ id, title, performer }) => ({
      id,
      title,
      performer
    }))
    return playlist
  }

  async verifyDuplicate (playlistId, songId) {
    const query = {
      text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (result.rows.length) {
      throw new InvariantError('Lagu sudah pernah ditambahkan pada playlist')
    }
  }
}

module.exports = PlaylistSongsService
