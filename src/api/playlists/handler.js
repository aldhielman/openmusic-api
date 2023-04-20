const autoBind = require('auto-bind');

const ACTION_ADD = 'add';
const ACTION_REMOVE = 'delete';

class PlaylistHandler {
  constructor(
    playlistsService,
    playlistSongsService,
    songsService,
    playlistActivitiesService,
    validator,
  ) {
    this.playlistsService = playlistsService;
    this.playlistSongsService = playlistSongsService;
    this.songsService = songsService;
    this.playlistActivitiesService = playlistActivitiesService;
    this.validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this.validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;
    const playlistId = await this.playlistsService.addPlaylist(name, owner);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this.playlistsService.getPlaylist(owner);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistOwner(id, owner);

    await this.playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    this.validator.validatePostPlaylistSongPayload(request.payload);
    const { id: owner } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    const playlist = await this.playlistsService.getPlaylistById(playlistId);
    const song = await this.songsService.getSongById(songId);
    await this.playlistsService.verifyPlaylistAccess(playlist.id, owner);
    await this.playlistSongsService.verifyDuplicate(playlist.id, song.id);
    await this.playlistSongsService.addPlaylistSong(playlist.id, song.id);
    await this.playlistActivitiesService.addActivity(
      playlist.id,
      song.id,
      owner,
      ACTION_ADD,
    );

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan di dalam Playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistAccess(playlistId, owner);
    const playlist = await this.playlistSongsService.getPlaylistSongs(
      playlistId,
    );

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
    return response;
  }

  async deletePlaylistSongByIdHandler(request, h) {
    this.validator.validateDeletePlaylistSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistAccess(playlistId, owner);
    await this.playlistSongsService.deletePlaylistSongById(playlistId, songId);
    await this.playlistActivitiesService.addActivity(
      playlistId,
      songId,
      owner,
      ACTION_REMOVE,
    );

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari Playlist',
    });
    return response;
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistAccess(playlistId, owner);
    const data = await this.playlistActivitiesService.getPlaylistActivities(
      playlistId,
    );

    const response = h.response({
      status: 'success',
      data,
    });
    return response;
  }
}

module.exports = PlaylistHandler;
