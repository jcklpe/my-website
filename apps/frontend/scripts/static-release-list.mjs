import { listStoredReleases, releaseStore } from './static-release.mjs';

const releases = await listStoredReleases();

console.log(`Static release store: ${releaseStore}`);

if (!releases.length) {
  console.log('No verified releases are stored.');
  process.exit(0);
}

for (const release of releases) {
  console.log(
    `${release.releaseId}${release.pinned ? ' [pinned]' : ''} — ${release.fileCount} files, ${release.contentHash.slice(0, 12)}, ${release.canonicalOrigin}`,
  );
}
