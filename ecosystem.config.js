module.exports = {
  apps: [
    {
      name: 'scorefluence',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/scorefluence',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/scorefluence-error.log',
      out_file: '/var/log/pm2/scorefluence-out.log',
      log_file: '/var/log/pm2/scorefluence.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
      restart_delay: 4000,
      watch: false,
      ignore_watch: [
        'node_modules',
        '.next',
        'logs',
        '*.log'
      ],
      min_uptime: '10s',
      max_restarts: 10,
      kill_timeout: 5000,
      listen_timeout: 3000,
      wait_ready: true
    }
  ]
}