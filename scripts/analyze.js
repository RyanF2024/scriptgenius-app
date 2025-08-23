const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { ANALYZE } = process.env;

module.exports = (nextConfig = {}) => {
  return {
    ...nextConfig,
    webpack(config, options) {
      if (ANALYZE) {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: options.isServer ? 8888 : 8889,
            openAnalyzer: true,
          })
        );
      }

      // Apply any existing webpack configuration
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  };
};
