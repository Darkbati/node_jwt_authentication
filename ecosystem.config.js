module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps : [
      // First application
      {
        name      : 'Authentication Server',
        script    : './server.js',
		watch     : false,
        instance  : 4,
        exec_mode : 'cluster',
        max_memory_restart: "1G",
		autorestart: true,
        env: {
          NODE_ENV: 'development'
        },
        env_production : {
          NODE_ENV: 'production'
        },
		env_qa : {
          NODE_ENV: 'qa'
        }
      },
    ],
  };