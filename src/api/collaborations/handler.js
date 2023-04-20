const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(
    collaborationsService,
    playlistsService,
    usersService,
    validator,
  ) {
    this.collaborationsService = collaborationsService;
    this.playlistsService = playlistsService;
    this.usersService = usersService;
    this.validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const user = await this.usersService.getUserById(userId);
    const collaborationId = await this.collaborationsService.addCollaboration(
      playlistId,
      user.id,
    );

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this.validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this.collaborationsService.deleteCollaboration(playlistId, userId);
    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
