require('dotenv').config();

const { Console } = require('console');

const console = new Console(process.stdout, process.stderr);

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

// cache
const CacheService = require('./services/redis/CacheService');

const cacheService = new CacheService();

// albums
const albums = require('./api/albums');
const AlbumsValidator = require('./validator/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');

const albumsService = new AlbumsService();
const albumLikesService = new AlbumLikesService(cacheService);

// songs
const songs = require('./api/songs');
const SongsValidator = require('./validator/songs');
const SongsService = require('./services/postgres/SongsService');

const songsService = new SongsService();

// users
const users = require('./api/users');
const UsersValidator = require('./validator/users');
const UsersService = require('./services/postgres/UsersService');

const usersService = new UsersService();

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');

const authenticationsService = new AuthenticationsService();

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const collaborationsService = new CollaborationsService();

// playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');

const playlistsService = new PlaylistsService(collaborationsService);
const playlistSongsService = new PlaylistSongsService(playlistsService);
const playlistActivitiesService = new PlaylistActivitiesService(
  playlistsService,
);

// Exports
const playlistsExport = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/S3/StorageService');
const UploadsValidator = require('./validator/uploads');
const config = require('./utils/config');

const storageService = new StorageService();

const init = async () => {
  const server = Hapi.server({
    port: config.server.port,
    host: config.server.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.jwt.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        albumLikesService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        playlistSongsService,
        songsService,
        playlistActivitiesService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: playlistsExport,
      options: {
        producerService: ProducerService,
        playlistService: playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      console.log(response);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
