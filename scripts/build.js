const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCategory(category) {
  const dir = path.join(DATA_DIR, category);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const items = [];
  const seenIds = new Set();

  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const rawText = fs.readFileSync(fullPath, 'utf-8');
      const chineseMatches = rawText.match(/[\u4e00-\u9fa5]/);
      if (chineseMatches) {
        throw new Error(`File ${file} contains Chinese characters: "${chineseMatches[0]}". Database records must use standard international English notation.`);
      }

      const content = JSON.parse(rawText);
      if (!Array.isArray(content)) {
        throw new Error(`File ${file} does not contain a JSON array.`);
      }
      for (const item of content) {
        if (!item.id) {
          throw new Error(`Item in ${file} is missing 'id': ${JSON.stringify(item)}`);
        }
        if (seenIds.has(item.id)) {
          throw new Error(`Duplicate id found across ${category}: '${item.id}' in ${file}`);
        }
        seenIds.add(item.id);
        items.push(item);
      }
    } catch (err) {
      console.error(`Error reading ${fullPath}:`, err.message);
      process.exit(1);
    }
  }

  return items;
}

function build() {
  console.log('Building RollKeeper gear database...');

  const cameras = loadCategory('cameras');
  const lenses = loadCategory('lenses');
  const films = loadCategory('films');
  const developers = loadCategory('developers');

  // Determine version
  let version = 2; // Incremented from initial v1
  const existingDist = path.join(DIST_DIR, 'gears.json');
  if (fs.existsSync(existingDist)) {
    try {
      const prev = JSON.parse(fs.readFileSync(existingDist, 'utf-8'));
      if (typeof prev.version === 'number') {
        version = Math.max(version, prev.version);
      }
    } catch (_) {}
  }

  // Check if --bump flag was passed
  if (process.argv.includes('--bump')) {
    version += 1;
    console.log(`Bumped version to v${version}`);
  }

  const nowIso = new Date().toISOString();

  const database = {
    version,
    updatedAt: nowIso,
    cameras,
    lenses,
    films,
    developers,
  };

  ensureDir(DIST_DIR);

  // Write pretty json
  fs.writeFileSync(
    path.join(DIST_DIR, 'gears.json'),
    JSON.stringify(database, null, 2) + '\n',
    'utf-8'
  );

  // Write minified json
  fs.writeFileSync(
    path.join(DIST_DIR, 'gears.min.json'),
    JSON.stringify(database),
    'utf-8'
  );

  console.log('✓ Successfully generated dist/gears.json and dist/gears.min.json');
  console.log(`  - Cameras: ${cameras.length}`);
  console.log(`  - Lenses: ${lenses.length}`);
  console.log(`  - Films: ${films.length}`);
  console.log(`  - Developers: ${developers.length}`);
  console.log(`  - Database Version: ${version}`);

  // Sync to RollKeeper desktop app if requested or if repo exists adjacent
  const shouldSync = process.argv.includes('--sync') || process.env.SYNC_TO_APP === 'true';
  const appPath = path.resolve(ROOT_DIR, '..', 'RollKeeper');

  if (shouldSync && fs.existsSync(appPath)) {
    console.log('\nSyncing to RollKeeper desktop app...');
    const publicGears = path.join(appPath, 'public', 'gears.json');
    const tauriGears = path.join(appPath, 'src-tauri', 'gears.json');

    fs.writeFileSync(publicGears, JSON.stringify(database, null, 2) + '\n', 'utf-8');
    fs.writeFileSync(tauriGears, JSON.stringify(database, null, 2) + '\n', 'utf-8');
    console.log('✓ Synced to:');
    console.log(`  - ${publicGears}`);
    console.log(`  - ${tauriGears}`);
  }
}

build();
