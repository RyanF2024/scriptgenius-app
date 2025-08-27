const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const PACKAGE_JSON = path.join(__dirname, '../package.json');
const LOCK_FILE = path.join(__dirname, '../yarn.lock') || 
                 path.join(__dirname, '../package-lock.json');

// Known large dependencies that can be optimized
const LARGE_DEPS = {
  'moment': 'date-fns',
  'lodash': 'lodash-es',
  'react-icons': 'lucide-react',
  '@fullcalendar': 'react-big-calendar',
  'bootstrap': 'tailwindcss',
  'jquery': 'none' // Consider removing if possible
};

// Dependencies that can be lazy loaded
const LAZY_LOAD_DEPS = [
  'react-query',
  'react-pdf',
  'react-chartjs-2',
  'react-markdown',
  'highlight.js'
];

async function analyzeDependencies() {
  console.log('🔍 Analyzing dependencies...');
  
  // Read package.json
  const pkg = JSON.parse(await readFile(PACKAGE_JSON, 'utf-8'));
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies
  };

  // Check for large dependencies
  console.log('\n📦 Large Dependencies to Optimize:');
  let optimizations = [];
  
  Object.entries(LARGE_DEPS).forEach(([dep, alternative]) => {
    if (deps[dep]) {
      console.log(`  ⚠️  ${dep} can be replaced with ${alternative}`);
      optimizations.push({
        type: 'replace',
        from: dep,
        to: alternative,
        reason: 'Smaller alternative available'
      });
    }
  });

  // Check for lazy load opportunities
  console.log('\n🔄 Dependencies to Lazy Load:');
  LAZY_LOAD_DEPS.forEach(dep => {
    if (deps[dep]) {
      console.log(`  🔄 ${dep} should be lazy loaded`);
      optimizations.push({
        type: 'lazy',
        package: dep,
        reason: 'Good candidate for code splitting'
      });
    }
  });

  // Check for duplicate dependencies
  console.log('\n🔍 Checking for duplicate dependencies...');
  try {
    const lockFile = await readFile(LOCK_FILE, 'utf-8');
    const duplicates = new Set();
    
    Object.keys(deps).forEach(dep => {
      const regex = new RegExp(`\\b${dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}@([^\s:]+)`, 'g');
      const versions = new Set();
      let match;
      
      while ((match = regex.exec(lockFile)) !== null) {
        versions.add(match[1]);
      }
      
      if (versions.size > 1) {
        console.log(`  ⚠️  ${dep} has multiple versions: ${Array.from(versions).join(', ')}`);
        duplicates.add(dep);
      }
    });
    
    if (duplicates.size === 0) {
      console.log('  ✅ No duplicate versions found!');
    } else {
      optimizations.push({
        type: 'duplicate',
        packages: Array.from(duplicates),
        reason: 'Multiple versions of the same package found'
      });
    }
  } catch (error) {
    console.warn('  ⚠️  Could not analyze lock file:', error.message);
  }

  // Generate optimization report
  const report = {
    timestamp: new Date().toISOString(),
    optimizations,
    summary: {
      totalDependencies: Object.keys(deps).length,
      optimizationsAvailable: optimizations.length
    }
  };

  await writeFile(
    path.join(__dirname, '../optimization-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n✅ Optimization report generated at optimization-report.json');
  console.log('\n💡 Run `npm run optimize` to apply these optimizations');
}

// Run the analysis
analyzeDependencies().catch(console.error);
