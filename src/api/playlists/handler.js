const autoBind = require("auto-bind");

const ACTION_ADD = "add";
const ACTION_REMOVE = "delete";

class PlaylistHandler {
  constructor(
    playlistsService,
    playlistSongsService,
    songsService,
    playlistActivitiesService,
    validator
  ) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist(name, owner);

    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylist(owner);
    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, owner);

    await this._playlistsService.deletePlaylistById(id);

    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);
    const { id: owner } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    const playlist = await this._playlistsService.getPlaylistById(playlistId);
    const song = await this._songsService.getSongById(songId);
    await this._playlistsService.verifyPlaylistAccess(playlist.id, owner);
    await this._playlistSongsService.verifyDuplicate(playlist.id, song.id);
    await this._playlistSongsService.addPlaylistSong(playlist.id, song.id);
    await this._playlistActivitiesService.addActivity(
      playlist.id,
      song.id,
      owner,
      ACTION_ADD
    );

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan di dalam Playlist",
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, owner);
    const playlist = await this._playlistSongsService.getPlaylistSongs(
      playlistId
    );

    const response = h.response({
      status: "success",
      data: {
        playlist,
      },
    });
    return response;
  }

  async deletePlaylistSongByIdHandler(request, h) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, owner);
    await this._playlistSongsService.deletePlaylistSongById(playlistId, songId);
    await this._playlistActivitiesService.addActivity(
      playlistId,
      songId,
      owner,
      ACTION_REMOVE
    );

    const response = h.response({
      status: "success",
      message: "Lagu berhasil dihapus dari Playlist",
    });
    return response;
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, owner);
    const data = await this._playlistActivitiesService.getPlaylistActivities(
      playlistId
    );

    const response = h.response({
      status: "success",
      data,
    });
    return response;
  }
}

module.exports = PlaylistHandler;
