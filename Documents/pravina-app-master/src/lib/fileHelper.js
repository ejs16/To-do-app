// Import necessary libraries and packages
import { tmpdir } from 'os';
import { join } from 'path';
import fs from 'fs';

async function generateClientFolder() {
  const randomFolderName = Math.random().toString(36).substring(2, 15);
  const filePath = join(tmpdir(), randomFolderName);
  // Create a folder in the temporary directory
  await fs.promises.mkdir(filePath);
  return filePath;
}

export default generateClientFolder;