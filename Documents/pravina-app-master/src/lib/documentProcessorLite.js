// Import necessary libraries and packages
import path from "path";
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import Task from '../models/Task';
import File from "@/models/File";
import classifyDocument from '@/lib/documentClassifier';
import AWS from 'aws-sdk';

const openai = new OpenAI({apiKey:'sk-proj-eE6nZcpYoccqeYHW5uWZT3BlbkFJM2mPaok0Cm0zgj6f8Cpe'});
const MODEL = "text-embedding-ada-002";

// Initialize Pinecone API client
const pineconeClient = new Pinecone({
  apiKey: '6232ba58-fbef-4d43-b47c-24435a166b63'
});
var indexName = "pravina-index";

// Configure the AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function setStatus(taskId, status, percentComplete) {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { 'taskId': taskId },
      { status, percentComplete },
      { new: true }
    );
    console.log('Task status updated successfully');
  } catch (error) {
    console.error('Error updating task status:', error);
  }
}

// Create Pinecone index if it doesn't exist
async function ensureIndex(indexName) {
  const indexes = await pineconeClient.listIndexes();
  const indexExists = indexes.indexes.some(index => index.name === indexName);


  if (!indexExists) {
    await pineconeClient.createIndex({
      name: indexName,
      dimension: 1536,
      metric: "cosine",
      spec: {
        serverless: { 
          cloud: 'aws', 
          region: 'us-east-1' 
        }
      },
    });
  }
}

// Function to preprocess text
function preprocessText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Function to add a new Task to the collection
async function addTask(startDate, fileId, userId, taskId) {
  const task = {
    startDate,
    endDate: null,
    fileId,
    userId,
    status: 'running',
    percentComplete: 2,
    taskId
  };

  try {
    // Add the task to the collection
    const existingTask = await Task.findOne({ taskId });
    if (existingTask) {
      console.log('Task already exists');
      return;
    }
    await new Task(task).save();
    console.log('Task added successfully');
  } catch (error) {
    console.error('Error adding task:', error);
  }
}


// Function to create embeddings using OpenAI
async function createEmbeddingsForFile(texts, filename) {
  const embeddingsList = [];

  for (let i = 0; i < texts.length; i++) {
    const text =  texts[i];

    const response = await openai.embeddings.create({
      model: MODEL,
      input: text.pageContent,
    });
    const embedding = response.data[0].embedding;
    embeddingsList.push([filename, text.pageContent, embedding]);
  }

  return embeddingsList;
}

// Gets file name from path
function getFileName(filePath) {
  return path.basename(filePath);
}

// Function to upsert embeddings into Pinecone
async function upsertEmbeddingsToPC(index, embeddingsWithIds, category, clientId) {
  const vectorsWithMetadata = embeddingsWithIds.map(([filename, text, embedding], index) => ({
    id: `${filename}_${index}`,
    values: embedding,
    metadata: { source: filename, category, text, clientId },
  }));

  await index.namespace(clientId).upsert(vectorsWithMetadata);
}

async function updateFile(fileId, cat, indexed) {
  try {
    const updatedFile = await File.findOneAndUpdate(
      { _id: fileId },
      { 
        indexed: indexed,
        category: cat 
      },
      { new: true }
    );
    console.log('File status updated successfully');
  } catch (error) {
    console.error('Error updating task status:', error);
  }
}

async function deleteFilesFromIndex(fileName, fileId, clientId) {
  const index = await pineconeClient.Index(indexName);


  try {
    const encodedFileName = encodeURIComponent(fileName);

    const results = await index.namespace(clientId).listPaginated({ prefix: encodedFileName });
    console.log(results);
    // Then, delete the records by ID:
    const vectorIds = results.vectors.map((vector) => vector.id);
    await index.namespace(clientId).deleteMany(vectorIds);
    await updateFile(fileId, false);
    return true;
  } catch (error) {
    console.error('Error deleting files from index:', error);
    return false;
  }
  console.log(results);

  // Then, delete the records by ID:
  const vectorIds = results.vectors.map((vector) => vector.id);
  await index.namespace(clientId).deleteMany(vectorIds);
  await updateFile(fileId, false);
  return true;
}

async function getTextFromDocument(filePath){
  const url = 'https://api.runpod.ai/v2/h1a4zx1q5v4n79/runsync';
  const data = {
    input: {
      s3Uri: filePath,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    console.log(responseData.output.texts);

    const processedTexts = responseData.output.texts.map(text => {
      // Apply your function to `text` here
      const processedText = preprocessText(text);
      return processedText;
    });
    return processedTexts;
  } catch (error) {
    console.error(`Error posting data: ${error}`);
  }
}


async function processDocument(filePath, clientId, userId, taskId, fileId) {  
  await addTask(new Date(), fileId.toString(), userId, taskId);
  const text = await getTextFromDocument(filePath);
  //const text = await extractTextFromFile(filePath);
  const category = await classifyDocument(text);
  const fileName = getFileName(filePath);
  await ensureIndex(indexName);
  const index = pineconeClient.Index(indexName);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  // Split text into chunks
  const texts = await splitter.createDocuments(text);
  console.log(texts);

  // Create embeddings for each chunk
  const embeddingsWithIds = await createEmbeddingsForFile(texts, fileName);

  // Upsert embeddings to Pinecone
  await upsertEmbeddingsToPC(index, embeddingsWithIds, category, clientId);
  console.log(`Processed and indexed ${fileName} for client ${clientId}`);
  updateFile(fileId, category, true);
  setStatus(taskId, 'completed', 100);
}

export default processDocument;
export { deleteFilesFromIndex };

