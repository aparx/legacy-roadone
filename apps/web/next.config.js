module.exports = {
  reactStrictMode: true,
  transpilePackages: ['theme-core', 'next-ui'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ];
  },
};
