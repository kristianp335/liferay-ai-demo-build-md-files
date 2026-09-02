/**
 * Figma REST API Node & Image Downloader (Hybrid Mode Preferred)
 * Usage: node fetch_figma.node.js --url <FIGMA_URL> [--token <FIGMA_TOKEN>]
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url') {
      const urlStr = args[++i];
      
      // Captura FILE_KEY soportando /design/, /proto/ y /file/
      const fileMatch = urlStr.match(/\/(file|design|proto)\/([a-zA-Z0-9]+)/);
      // Captura NODE_ID principal
      const nodeMatch = urlStr.match(/node-id=([0-9%3A-]+)/);
      
      if (fileMatch) options.fileKey = fileMatch[2];
      if (nodeMatch) options.nodeId = decodeURIComponent(nodeMatch[1]).replace('-', ':');
    }
    if (args[i] === '--file') options.fileKey = args[++i];
    if (args[i] === '--node') options.nodeId = args[++i];
    if (args[i] === '--token') options.token = args[++i];
  }
  return options;
}

function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status ${res.statusCode}: ${res.statusMessage}`));
      }
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

async function fetchFigmaHybrid() {
  const options = parseArgs();
  const token = options.token || process.env.FIGMA_TOKEN;

  if (!options.fileKey || !options.nodeId) {
    console.error('Error: Missing required Figma parameters (URL, fileKey or nodeId).');
    process.exit(1);
  }

  if (!token) {
    console.error('Error: FIGMA_TOKEN environment variable is not set.');
    process.exit(1);
  }

  const encodedNodeId = encodeURIComponent(options.nodeId);
  const cleanNodeId = options.nodeId.replace(/[:;]/g, '_');
  const headers = { 'X-Figma-Token': token };

  try {
    // 1. Fetch Node JSON Tree (Semantic & Data layer)
    console.log(`[1/2] [Hybrid Mode] Fetching JSON structure for node ${options.nodeId}...`);
    const jsonUrl = `https://api.figma.com/v1/files/${options.fileKey}/nodes?ids=${encodedNodeId}`;
    const jsonResponse = await httpGet(jsonUrl, headers);
    const jsonPath = path.join(process.cwd(), `figma_tree_${cleanNodeId}.json`);
    fs.writeFileSync(jsonPath, jsonResponse, 'utf-8');

    // 2. Fetch Rendered Image Snapshot (Visual Context layer)
    console.log(`[2/2] [Hybrid Mode] Rendering PNG snapshot from Figma API...`);
    const imageUrl = `https://api.figma.com/v1/images/${options.fileKey}?ids=${encodedNodeId}&format=png&scale=2`;
    const imageApiResponse = JSON.parse(await httpGet(imageUrl, headers));
    
    const renderUrl = imageApiResponse.images ? imageApiResponse.images[options.nodeId] : null;
    let imagePath = null;

    if (renderUrl) {
      imagePath = path.join(process.cwd(), `figma_snapshot_${cleanNodeId}.png`);
      await downloadBinary(renderUrl, imagePath);
      console.log(`Saved PNG snapshot to: ${imagePath}`);
    } else {
      console.warn('Warning: Could not render image snapshot. Falling back to JSON-only mode.');
    }

    console.log('\nHybrid Extraction Complete!');
    console.log(`JSON Tree: ${jsonPath}`);
    if (imagePath) console.log(`PNG Snapshot: ${imagePath}`);

  } catch (err) {
    console.error('Extraction failed:', err.message);
    process.exit(1);
  }
}

fetchFigmaHybrid();