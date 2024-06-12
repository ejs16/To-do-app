// Import necessary libraries and packages
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import OpenAI from 'openai';
import { PineconeStore } from "@langchain/pinecone";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

const openai = new OpenAI({apiKey:'sk-proj-eE6nZcpYoccqeYHW5uWZT3BlbkFJM2mPaok0Cm0zgj6f8Cpe'});
const MODEL = "text-embedding-ada-002";

//const pineconeIndexes = {};

// Initialize Pinecone API client
const pineconeClient = new Pinecone({
  apiKey: '6232ba58-fbef-4d43-b47c-24435a166b63'
});
const indexName = "pravina-index";
const index = pineconeClient.index(indexName);

// Configure embeddings and vector store
const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-ada-002",
    openAIApiKey: 'sk-proj-eE6nZcpYoccqeYHW5uWZT3BlbkFJM2mPaok0Cm0zgj6f8Cpe'
});

/* const vectorstore = await PineconeStore.fromExistingIndex(
  embeddings,
  { pineconeIndex: index },
);
 */

// Configure ChatGPT model
const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.0,
  openAIApiKey: 'sk-proj-eE6nZcpYoccqeYHW5uWZT3BlbkFJM2mPaok0Cm0zgj6f8Cpe'
});

// Initialize a retriever wrapper around the vector store
//const vectorStoreRetriever = vectorstore.asRetriever();

// Create RetrievalQAWithSourcesChain
// Create a system & human prompt for the chat model
 const SYSTEM_TEMPLATE = `You are a legal assistant, skilled in the rules and regulations of 
 immigration law. Your goal is to produce a high-quality support letter for whose context and information you 
 have. Your goal is to leverage that context to draft the support document. For example, the introduction should be accurate, relevant, 
 and provide examples of the particular candidate. The suggested criteria should be listed out based on the context information that you have and can use for the most persuasive case.Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;
const messages = [
  SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
];
const chatPrompt = ChatPromptTemplate.fromMessages(messages);

const documentChain = await createStuffDocumentsChain({
  llm: llm,
  prompt: chatPrompt,
});

/* const retrievalChain = await createRetrievalChain({
  retriever: vectorStoreRetriever,
  combineDocsChain: documentChain,
}); */

async function askQuestion(question, cid) {
  const vectorstore = await PineconeStore.fromExistingIndex(
    embeddings,
    { pineconeIndex: index, namespace: cid},
  );

  // Initialize a retriever wrapper around the vector store
  const vectorStoreRetriever = vectorstore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    retriever: vectorStoreRetriever,
    combineDocsChain: documentChain,
  });

  const input = question;
  const response = await retrievalChain.invoke({ input: question });
  console.log(`Asking question: ${question}`);
  return response.answer;
}

export default askQuestion;