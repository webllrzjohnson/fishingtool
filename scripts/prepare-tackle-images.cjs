// Produce intact lightweight previews. Apply a centre watermark only to audited
// project copies that were missing one or had the original mark in a corner.
// Never edit the owner's source images in OneDrive/Desktop/baits.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CommonJS image build script. */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..', 'public', 'tackle');
const sourceDir = path.join(root, 'generated');
const previewDir = path.join(root, 'previews');
const originals = {
  'cut-bait': '0e3cca1d2c5bc2d6d71443eba513ef891a3859d37c295438c66162032cc765ad',
  'dough-bait': 'ae132ab94dc881c088dace3eed3d95f1ab4bfdbc08198b98531c1aa8af835922',
  'soft-rubber': 'a55a3bd73bbffd4e372a372c8d60da31be56d2966eff8b674e9470d8216c0fec',
  'minnow-float': 'cd7294621ce75185fb97b39304896c6ec421ac01b3fb5f43876bb3fb98cf52fb',
  'worm-float': '45c6d5584a107d27c5dbda18789c901fb2b8259365a4c22eb9fc3139ff6d00ba',
  'ned': '68ffd70a9ef497419fa042afa3b175619eb4579bb8b476fdda76541fca36549b',
  'tube-ned': '099a3123e7f7be866eb28e14cb7369ccee10a139030d7323cbc48ec77183844f',
  'jig': '9e97f5f6e3416325898efe69fb2159fdba851d1545e4a4e2eaecca4ef11f0297',
  'swimbait': '6b20b9d259935d6cc248ea567b9ab7383fa6ed0e9c4ae06406131b4742663a02',
  'drop-shot': '6514bd672c9d3a7f4a0dcf5b0c6a0c1be3ef01820ea00204fe0122855bfd8bf8',
  'crankbait': 'aab5d0b61720cb524f19fb3e6e8da2d7ba611c67a1ae7843e635a7cf964f1994',
  'jerkbait': '8e21b2bbf4cc495e159e4824361eecacac42b6f24ace8b558813f82d969a3494',
  'spoon': 'a3dd28874ad1b1dab47df46c78bdff0989e128ea310fdb62ee889b71e4365e9f',
};
// The original hashes are the unmarked PNGs in commit 1a73f07. The marked
// hashes are the project copies committed with this script. Never watermark
// an unknown image or stamp an already-marked image a second time.
const marked = {
  'cut-bait': '495a08d674acdceaf1da2c56c0b94817bbcab5efe14b009b39703792c87aff17',
  'dough-bait': '19e5cf34caea69b96bc1be236c8382e30f12922e22ca6fb04ff8cc2d33fbbd43',
  'soft-rubber': '265cdfeaef404446253db38b415cd95cd88418bd4fa8540fbe9588d67cf6af39',
  'minnow-float': '4aa67da2b97616940a4cfbb440c831cb533666129479dd8a401d34b76ccf8eab',
  'worm-float': 'e2d0a99d8d390082e441c18a0b9b65fe305f7fe6a6666d83dd2b39bd6942ac7d',
  ned: '585e5528b3210bed343d256ef62d8e101c6b120d02d9f24ead9d74036087bb77',
  'tube-ned': '54451f84c61d4a3e289cc5a82d185621c50af59cf89b129c05bc71490ff6ea3d',
  jig: '57e57a4b4292a01bfe6b4eae1ef1bc875915d6b004c3d4fa650a66daf8af3cbb',
  swimbait: '8b25526ca65ddf549595ddb8ae1d0f8bbfb93d85f75b2344c337a578e21b903c',
  'drop-shot': 'a60d766719d380bf86799fb5e330c8a619250d4d156988d08a92809c267f55ca',
  crankbait: 'c19413caf5d4cc0943f01d6aefd249342474fb70ec2516d42b74b8d9bfc86df7',
  jerkbait: '6e026bcc3b1287b0625f391766c281f0b97190d2815c2b40a9744f8f45abd066',
  spoon: '5732a70d707a868a3e8be3bdb04c15fdb944252ed6a03711caf6f0d207e7897b',
};
const positions = {
  'jig': 60,
  'swimbait': 60,
  'minnow-float': 60,
  'ned': 65,
};

async function addWatermark(file, expectedHash) {
  const bytes = await fs.readFile(file);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  if (hash === marked[path.basename(file, '.png')]) return false;
  if (hash !== expectedHash) throw new Error(`Refusing to re-watermark or overwrite changed image: ${file}`);
  const { width, height } = await sharp(bytes).metadata();
  const size = Math.round(width * 0.027);
  // Put the mark over the open-water portion of the hero, above its line and
  // hook callouts. The posters' numbered instructional panels stay untouched.
  const id = path.basename(file, '.png');
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="${positions[id] ?? 50}%" y="${id === 'ned' ? 25 : 32}%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${size}" font-weight="bold" fill="#fff" fill-opacity="0.72" stroke="#14242a" stroke-opacity="0.45" stroke-width="2" paint-order="stroke">lesterfish</text></svg>`;
  const stamped = await sharp(bytes).composite([{ input: Buffer.from(svg) }])
    .png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
  await fs.writeFile(file, stamped);
  return true;
}

async function main() {
  const names = (await fs.readdir(sourceDir)).filter((name) => name.endsWith('.png')).sort();
  if (names.length !== 30) throw new Error(`Expected 30 original guides, found ${names.length}`);
  const mode = process.argv[2];
  if (mode && mode !== '--watermark-missing') throw new Error(`Unknown option: ${mode}`);
  if (mode === '--watermark-missing') {
    const selected = process.argv.slice(3);
    if (selected.some((id) => !originals[id])) throw new Error('Unknown watermark image ID');
    for (const id of selected.length ? selected : Object.keys(originals)) {
      const hash = originals[id];
      const added = await addWatermark(path.join(sourceDir, `${id}.png`), hash);
      console.log(`${added ? 'Added' : 'Already has'} centre watermark: ${id}`);
    }
  }
  await fs.mkdir(previewDir, { recursive: true });
  let originalBytes = 0;
  let previewBytes = 0;
  for (const name of names) {
    const source = path.join(sourceDir, name);
    const target = path.join(previewDir, name.replace(/\.png$/, '.webp'));
    originalBytes += (await fs.stat(source)).size;
    await sharp(source).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 75, effort: 5 }).toFile(target);
    previewBytes += (await fs.stat(target)).size;
  }
  console.log(`${names.length} complete previews: ${(previewBytes / 1e6).toFixed(2)} MB; originals: ${(originalBytes / 1e6).toFixed(2)} MB`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
