import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  mkdtemp,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const run = promisify(execFile);
const folderId = '1MeTsvtjn1ofjA2nf1y8LmCCASG3SgvTs';
const fileName = 'aslan-french-resume.pdf';
const outputDirectory = fileURLToPath(
  new URL('../apps/frontend/public/downloads/', import.meta.url),
);

async function main() {
  const account = process.env.RESUME_DRIVE_ACCOUNT || 'personal';
  let listing;
  try {
    const { stdout } = await run(
      'lifeos',
      ['drive', 'list', account, folderId, '--json'],
      { timeout: 60_000 },
    );
    listing = JSON.parse(stdout);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        'Resume refresh requires the lifeos CLI on PATH and an authenticated Google Drive account. See README.md.',
      );
    }
    throw error;
  }

  if (listing.nextPageToken) {
    throw new Error(
      'The resume folder listing is incomplete. Keep this dedicated folder small before refreshing.',
    );
  }
  const candidates = (listing.files ?? []).filter(
    (file) => file.name === fileName && file.mimeType === 'application/pdf',
  );
  if (candidates.length !== 1) {
    throw new Error(
      `Expected exactly one PDF named ${fileName} in the resume folder; found ${candidates.length}. Existing local PDF is unchanged.`,
    );
  }
  const source = candidates[0];
  if (!/^[\w-]+$/.test(source.id))
    throw new Error('Drive returned an invalid file ID.');

  await mkdir(outputDirectory, { recursive: true });
  const temporaryDirectory = await mkdtemp(
    path.join(outputDirectory, '.resume-'),
  );
  try {
    const temporaryFile = path.join(temporaryDirectory, fileName);
    await run(
      'lifeos',
      ['drive', 'download', account, source.id, '--out', temporaryFile],
      { timeout: 60_000 },
    );
    const bytes = await readFile(temporaryFile);
    if (
      bytes.length < 100 ||
      bytes.subarray(0, 5).toString() !== '%PDF-' ||
      !bytes.subarray(-2048).includes(Buffer.from('%%EOF'))
    ) {
      throw new Error(
        'Drive did not return a complete PDF. Existing local PDF is unchanged.',
      );
    }

    const outputFile = path.join(outputDirectory, fileName);
    const hash = createHash('sha256').update(bytes).digest('hex');
    let currentHash = '';
    try {
      currentHash = createHash('sha256')
        .update(await readFile(outputFile))
        .digest('hex');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (hash !== currentHash) await rename(temporaryFile, outputFile);
    const manifest = {
      sourceFolder: `https://drive.google.com/drive/folders/${folderId}`,
      sourceFile: `https://drive.google.com/file/d/${source.id}/view`,
      modifiedTime: source.modifiedTime,
      fileName,
      bytes: bytes.length,
      sha256: hash,
    };
    // Stable source metadata keeps repeated refreshes reviewable without timestamp-only diffs.
    await writeFile(
      new URL('./resume-source.json', import.meta.url),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    console.log(
      `${hash === currentHash ? 'Already current' : 'Updated'}: /downloads/${fileName} (${bytes.length} bytes)`,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
