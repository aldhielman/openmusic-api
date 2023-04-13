const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");

class PlaylistActivitiesService {
  constructor(playlistService) {
    this._pool = new Pool();
    this._playlistService = playlistService;
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = nanoid(16);
    const time = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlist_song_activities VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist Activities gagal ditambahkan");
    }
  }

  async getPlaylistActivities(playlistId) {
    const playlist = await this._playlistService.getPlaylistById(playlistId);
    const query = {
      text: "SELECT users.username as username,songs.title as title,action,time FROM playlist_song_activities LEFT JOIN users ON playlist_song_activities.user_id = users.id LEFT JOIN songs ON playlist_song_activities.song_id = songs.id WHERE playlist_song_activities.playlist_id = $1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    const data = {
      playlistId: playlist.id,
      activities: result.rows,
    };

    return data;
  }
}

module.exports = PlaylistActivitiesService;
