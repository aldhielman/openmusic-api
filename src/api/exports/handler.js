const autoBind = require("auto-bind");

class ExportsHandler {
  constructor(producerService, playlistService, validator) {
    this._producerService = producerService;
    this._playlistService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const { id: owner } = request.auth.credentials;
    const { playlistId } = request.params;
    await this._playlistService.verifyPlaylistOwner(playlistId, owner);

    const message = {
      targetEmail: request.payload.targetEmail,
      playlistId,
    };

    await this._producerService.sendMessage(
      "export:playlists",
      JSON.stringify(message)
    );

    const response = h.response({
      status: "success",
      message: "Permintaan Anda sedang kami proses",
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
