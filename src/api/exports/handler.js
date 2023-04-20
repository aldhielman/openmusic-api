const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(producerService, playlistService, validator) {
    this.producerService = producerService;
    this.playlistService = playlistService;
    this.validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this.validator.validateExportPlaylistsPayload(request.payload);
    const { id: owner } = request.auth.credentials;
    const { playlistId } = request.params;
    await this.playlistService.verifyPlaylistOwner(playlistId, owner);

    const message = {
      targetEmail: request.payload.targetEmail,
      playlistId,
    };

    await this.producerService.sendMessage(
      'export:playlists',
      JSON.stringify(message),
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
