const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(service, albumLikesService, validator) {
    this.service = service;
    this.albumLikesService = albumLikesService;
    this.validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this.service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this.service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this.service.editAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });

    return response;
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this.service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikeByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this.service.getAlbumById(albumId);
    await this.albumLikesService.verifyDuplicate(albumId, userId);

    await this.albumLikesService.addLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
    });

    response.code(201);
    return response;
  }

  async deleteAlbumLikeByIdHandler(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this.albumLikesService.deleteLikeById(albumId, userId);

    return {
      status: 'success',
      message: 'Like berhasil dihapus',
    };
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const likes = await this.albumLikesService.getLikes(albumId);
    const response = h.response({
      status: 'success',
      data: {
        likes: likes.count,
      },
    });

    if (likes.cache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = AlbumHandler;
