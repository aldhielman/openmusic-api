const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this.service = service;
    this.albumsService = albumsService;
    this.validator = validator;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;
    this.validator.validateImageHeaders(cover.hapi.headers);
    const coverUrl = await this.service.writeFile(cover, cover.hapi);

    const album = await this.albumsService.getAlbumById(albumId);
    this.albumsService.editAlbumById(albumId, { ...album, coverUrl });

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
