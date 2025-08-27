const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const PACKAGE_JSON = path.join(__dirname, '../package.json');
const NEXT_CONFIG = path.join(__dirname, '../next.config.js');

async function applyOptimizations() {
  console.log('🚀 Applying optimizations...');
  
  // 1. Update package.json
  console.log('\n📦 Updating package.json...');
  const pkg = JSON.parse(await readFile(PACKAGE_JSON, 'utf-8'));
  
  // Add optimization scripts if they don't exist
  if (!pkg.scripts) pkg.scripts = {};
  
  pkg.scripts = {
    ...pkg.scripts,
    'analyze': 'ANALYZE=true next build',
    'profile': 'NEXT_PROFILING=1 next build',
    'optimize': 'node scripts/optimize-deps.js',
    'optimize:apply': 'node scripts/apply-optimizations.js',
  };
  
  // Add recommended dependencies
  const recommendedDeps = {
    'next-bundle-analyzer': '^1.0.0',
    'webpack-bundle-analyzer': '^4.9.1',
    'duplicate-package-checker-webpack-plugin': '^3.0.0',
    'webpack-stats-plugin': '^1.1.0',
    'cross-env': '^7.0.3',
  };
  
  pkg.devDependencies = {
    ...pkg.devDependencies,
    ...recommendedDeps
  };
  
  await writeFile(PACKAGE_JSON, JSON.stringify(pkg, null, 2));
  console.log('  ✅ package.json updated');
  
  // 2. Update next.config.js with optimizations
  console.log('\n⚙️  Updating Next.js config...');
  let nextConfig = await readFile(NEXT_CONFIG, 'utf-8');
  
  // Add bundle analyzer if not present
  if (!nextConfig.includes('withBundleAnalyzer')) {
    const bundleAnalyzerConfig = `
// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

module.exports = withBundleAnalyzer({
  // Your existing config here
  ...
});
    `;
    
    nextConfig = nextConfig.replace(
      'module.exports = {',
      bundleAnalyzerConfig
    );
  }
  
  // Add webpack optimizations
  if (!nextConfig.includes('webpack: (config, { isServer, dev })')) {
    const webpackConfig = `
  webpack: (config, { isServer, dev }) => {
    // Only optimize in production
    if (!dev && !isServer) {
      // Optimize moment.js locales
      config.plugins.push(
        new (require('webpack').ContextReplacementPlugin)(
          /moment[/\\\\]locale$/,
          /en|es|fr/ // Only include necessary locales
        )
      );
      
      // Add bundle analyzer for production builds
      if (process.env.ANALYZE) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-analyzer-report.html',
            openAnalyzer: true,
          })
        );
      }
    }
    
    return config;
  },
    `;
    
    nextConfig = nextConfig.replace(
      /(module.exports = \{)([^}]*)\}/s,
      `$1$2${webpackConfig}}`
    );
  }
  
  await writeFile(NEXT_CONFIG, nextConfig);
  console.log('  ✅ Next.js config updated');
  
  // 3. Install updated dependencies
  console.log('\n📥 Installing updated dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('  ✅ Dependencies installed');
  } catch (error) {
    console.error('  ❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
  
  console.log('\n✨ Optimization complete!');
  console.log('\nNext steps:');
  console.log('1. Run `npm run analyze` to see the bundle analysis');
  console.log('2. Check optimization-report.json for specific recommendations');
  console.log('3. Run `npm run build` to verify everything works');
}

// Run the optimization
applyOptimizations().catch(console.error);
