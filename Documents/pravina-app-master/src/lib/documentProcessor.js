// Import necessary libraries and packages
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import pdfParse from "pdf-parse";
import fs from 'fs';
import path from "path";
import unzip from "unzipper";

// Initialize OpenAI API client
const openaiConfig = new Configuration({
  apiKey: "sk-proj-eE6nZcpYoccqeYHW5uWZT3BlbkFJM2mPaok0Cm0zgj6f8Cpe",
});
const openaiClient = new OpenAIApi(openaiConfig);
const MODEL = "text-embedding-ada-002";

// Initialize Pinecone API client
const pineconeClient = pinecone.initialize({
  apiKey: "6232ba58-fbef-4d43-b47c-24435a166b63",
  environment: "gcp-starter",
});

const indexName = "eduardo-index";

// Create Pinecone index if it doesn't exist
async function ensureIndex() {
  const indexes = await pineconeClient.listIndexes();
  if (!indexes.includes(indexName)) {
    await pineconeClient.createIndex({
      name: indexName,
      dimension: 1536,
      metric: "cosine",
      spec: {
        cloud: "aws",
        region: "us-east-1",
      },
    });
  }
}

const index = pineconeClient.Index(indexName);

// Function to preprocess text
function preprocessText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Function to process a PDF and return split text chunks
async function processPDF(filePath) {
  const pdfData = fs.readFileSync(filePath);
  const { text } = await pdfParse(pdfData);
  const chunkSize = 1000;
  const chunkOverlap = 100;
  const processedText = preprocessText(text);

  const chunks = [];
  for (let i = 0; i < processedText.length; i += chunkSize - chunkOverlap) {
    chunks.push(processedText.substring(i, Math.min(i + chunkSize, processedText.length)));
  }
  return chunks;
}

// Function to create embeddings using OpenAI
async function createEmbeddings(texts, filenames) {
  const embeddingsList = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const filename = filenames[i];
    const response = await openaiClient.createEmbedding({
      model: MODEL,
      input: text,
    });
    const embedding = response.data[0].embedding;
    embeddingsList.push([filename, text, embedding]);
  }

  return embeddingsList;
}

// Function to unzip file to tmp directory
function unzipFileToTmp(filePath) {
    const tmpDirectory = "/tmp";

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(unzip.Extract({ path: tmpDirectory }))
            .on("close", () => {
                resolve(tmpDirectory);
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}


// Function to upsert embeddings into Pinecone
async function upsertEmbeddingsToPinecone(index, embeddingsWithIds) {
  const vectorsWithMetadata = embeddingsWithIds.map(([filename, text, embedding], index) => ({
    id: `${filename[0]}_${index}`,
    values: embedding,
    metadata: { source: filename[0], text, category: filename[1] },
  }));

  await index.upsert({ vectors: vectorsWithMetadata });
}

// Function to process all files in the base directory
async function processAllFiles(baseDirectory) {
  await ensureIndex();

  const categories = fs.readdirSync(baseDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const category of categories) {
    const categoryDir = path.join(baseDirectory, category);

    fs.readdirSync(categoryDir).forEach(async (filename) => {
      if (filename.endsWith(".pdf")) {
        const filePath = path.join(categoryDir, filename);
        const texts = await processPDF(filePath);
        const filenames = Array(texts.length).fill([filename, category]);
        const embeddingsWithIds = await createEmbeddings(texts, filenames);
        await upsertEmbeddingsToPinecone(index, embeddingsWithIds);
        console.log(`Processed and indexed ${filename} under category ${category}`);
      }
    });
  }
}

async function processZipFile(filePath) {
    const baseDirectory = await unzipFileToTmp(filePath);
    await processAllFiles(baseDirectory);
}

export default processZipFile;

