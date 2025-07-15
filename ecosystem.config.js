module.exports = {
  apps: [
    {
      name: 'index',
      script: 'server/dist/index.js',
      env: {
        PORT: 53840,
      },
    },
  ],
}
