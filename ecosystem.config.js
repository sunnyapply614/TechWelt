module.exports = {
  apps : [{
    name: 'Social Experience App Backend',
    script: 'nodemon ./server.js',
    insances: 'max',
    max_memory_restart: "256M",
    env:  {
      NODE_ENV : "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }],


  }
};
