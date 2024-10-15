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

  deploy : {
    production : {
      user : 'ec2-user',
      host : 'ec2-103-4-8-90.ap-northeast-1.compute.amazonaws.com',
      key  : '../social_experience_app_key.pem',
      ref  : 'origin/develop',
      repo : 'git@github.com:gentlyawesome/social_experience_app_dev.git',
      path : '/home/ec2-user/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
