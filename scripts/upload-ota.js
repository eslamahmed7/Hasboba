import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
    process.exit(1);
  }

  // Get version from command line arguments or package.json
  let version = process.argv[2];
  if (!version) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
      version = packageJson.version || '1.0.0';
    } catch (e) {
      version = '1.0.0';
    }
  }

  // Ensure version starts without 'v' or clean it up
  version = version.replace(/^v/, '');

  console.log(`Preparing OTA Update for version: ${version}...`);

  // Initialize Supabase Client with Service Role Key for administrative access
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const zipPath = path.join(process.cwd(), 'dist.zip');
  if (!fs.existsSync(zipPath)) {
    console.error(`Error: dist.zip not found at ${zipPath}. Make sure you built and zipped the web assets.`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(zipPath);
  const bucketName = 'ota-updates';
  const storageFileName = `releases/release-${version}.zip`;

  // 1. Try to create bucket if it doesn't exist (fails silently if it already exists or isn't allowed)
  try {
    console.log(`Checking/Creating bucket: ${bucketName}...`);
    await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['application/zip']
    });
  } catch (err) {
    // Ignore error if bucket already exists
  }

  // 2. Upload zip file to Supabase Storage
  console.log(`Uploading ${zipPath} to bucket '${bucketName}' as '${storageFileName}'...`);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storageFileName, fileBuffer, {
      contentType: 'application/zip',
      upsert: true
    });

  if (uploadError) {
    console.error('Error uploading zip to storage:', uploadError.message);
    process.exit(1);
  }

  console.log('Upload successful! Data:', uploadData);

  // 3. Get the public URL of the uploaded zip
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(storageFileName);

  console.log(`Public URL of the update zip: ${publicUrl}`);

  // 4. Retrieve changelog from the latest git commit message
  let changelog = 'تحديث فوري للنظام وإصلاح بعض الأخطاء وتحسين الأداء.';
  try {
    const commitMsg = execSync('git log -1 --pretty=%B').toString().trim();
    if (commitMsg) {
      changelog = commitMsg;
    }
  } catch (e) {
    console.log('Could not retrieve git commit message, using default changelog.');
  }

  console.log(`Changelog: "${changelog}"`);

  // 5. Update app_version table with the new release
  console.log('Inserting new version record into app_version table...');
  const { error: dbError } = await supabase
    .from('app_version')
    .insert({
      version: version,
      changelog: changelog,
      download_url: publicUrl,
    });

  if (dbError) {
    console.error('Error updating app_version table:', dbError.message);
    process.exit(1);
  }

  console.log('OTA Update published successfully! 🎉');
}

main().catch((err) => {
  console.error('Unhandled error in OTA publisher:', err);
  process.exit(1);
});
