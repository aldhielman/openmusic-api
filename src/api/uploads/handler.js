const autoBind = require("auto-bind");

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);
    const coverUrl = await this._service.writeFile(cover, cover.hapi);

    const album = await this._albumsService.getAlbumById(albumId);
    this._albumsService.editAlbumById(albumId, { ...album, coverUrl });

    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
