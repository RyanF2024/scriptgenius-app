const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

// Configuration
const CONFIG = {
  outputPath: path.join(__dirname, '../.next/analyze'),
  statsFile: 'stats.json',
  reportFile: 'report.html',
  threshold: 500 * 1024, // 500KB
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputPath)) {
  fs.mkdirSync(CONFIG.outputPath, { recursive: true });
}

// Generate webpack stats
console.log('🔍 Generating bundle analysis...');
try {
  // Run production build with stats
  execSync('cross-env ANALYZE=true next build', { stdio: 'inherit' });
  
  console.log('✅ Bundle analysis completed successfully!');
  console.log(`📊 Report generated at: ${path.join(CONFIG.outputPath, CONFIG.reportFile)}`);
  
  // Additional analysis
  console.log('\n📦 Large Dependencies:');
  const stats = require(path.join(process.cwd(), '.next/analyze/stats.json'));
  
  // Analyze large modules
  const largeModules = stats.chunks
    .flatMap(chunk => chunk.modules)
    .filter(module => module.size > CONFIG.threshold)
    .sort((a, b) => b.size - a.size);
  
  largeModules.forEach(module => {
    console.log(`  ${(module.size / 1024).toFixed(2)} KB: ${module.name}`);
  });
  
  // Check for duplicate packages
  console.log('\n🔍 Checking for duplicate packages...');
  const duplicates = new Set();
  
  stats.chunks.forEach(chunk => {
    chunk.modules.forEach(module => {
      const match = module.name.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
      if (match) {
        const pkg = match[1];
        if (duplicates.has(pkg)) return;
        
        const versions = new Set();
        const regex = new RegExp(`node_modules(\\|\/)${pkg.replace(/\//g, '\\/')}(\\|\/)[^/]+`);
        
        stats.chunks.forEach(c => {
          c.modules.forEach(m => {
            const versionMatch = m.name.match(regex);
            if (versionMatch) {
              versions.add(versionMatch[0].split(/[\/\\]/).pop());
            }
          });
        });
        
        if (versions.size > 1) {
          console.log(`  ⚠️  ${pkg} has multiple versions: ${Array.from(versions).join(', ')}`);
          duplicates.add(pkg);
        }
      }
    });
  });
  
  if (duplicates.size === 0) {
    console.log('  ✅ No duplicate packages found!');
  }
  
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message);
  process.exit(1);
}
