import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let geminiClient = null;
let openaiClient = null;

function getGeminiClient() {
  if (!geminiClient && env.LLM_API_KEY) {
    geminiClient = new GoogleGenerativeAI(env.LLM_API_KEY);
  }
  return geminiClient;
}

function getOpenAIClient() {
  if (!openaiClient) {
    const key = env.OPENAI_API_KEY || env.GROQ_API_KEY || env.OPENROUTER_API_KEY;
    const baseURL = env.GROQ_API_KEY
      ? 'https://api.groq.com/openai/v1'
      : env.OPENROUTER_API_KEY
      ? 'https://openrouter.ai/api/v1'
      : undefined;

    if (key) {
      openaiClient = new OpenAI({ apiKey: key, baseURL });
    }
  }
  return openaiClient;
}

/**
 * Intelligent local grounded synthesizer used when external LLM API key is not provided
 */
function generateLocalGroundedAnswer(question, retrievedChunks) {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return "I couldn't find reliable information about that in the college knowledge base. Please check with the college administration or refer to official departmental notices.";
  }

  const topChunk = retrievedChunks[0];
  const docName = topChunk.metadata?.documentName || 'College Document';
  const pageNum = topChunk.pageNumber || 1;

  // Extract clean meaningful content blocks
  const paragraphs = topChunk.text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20 && !p.startsWith('%PDF'));

  const keywords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !['what', 'how', 'when', 'where', 'tell', 'show', 'give'].includes(w));

  let relevantBlocks = paragraphs.filter((p) => {
    const pLower = p.toLowerCase();
    return keywords.some((k) => pLower.includes(k));
  });

  if (relevantBlocks.length === 0) {
    relevantBlocks = paragraphs.slice(0, 3);
  }

  const body = relevantBlocks.slice(0, 4).join('\n\n');

  return `Based on the official **${docName}** (Page ${pageNum}):\n\n${body}\n\n*(Source: ${docName}, Page ${pageNum})*`;
}

/**
 * Executes LLM Generation
 */
export async function generateAnswer({ systemPrompt, userPrompt, question, retrievedChunks = [] }) {
  const startTime = Date.now();
  const provider = (env.LLM_PROVIDER || 'gemini').toLowerCase();

  // 1. Try Gemini
  if (provider === 'gemini' && env.LLM_API_KEY) {
    try {
      logger.rag('LLM', `Calling Gemini API (${env.LLM_MODEL})...`);
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({
        model: env.LLM_MODEL || 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });

      const response = await model.generateContent(userPrompt);
      const text = response.response.text();
      const responseTimeMs = Date.now() - startTime;

      return {
        answer: text.trim(),
        provider: 'gemini',
        model: env.LLM_MODEL || 'gemini-1.5-flash',
        responseTimeMs,
        fallbackUsed: false,
      };
    } catch (err) {
      logger.warn(`Gemini generation failed (${err.message}). Falling back.`);
    }
  }

  // 2. Try OpenAI / Groq / OpenRouter
  if ((provider === 'openai' || env.OPENAI_API_KEY || env.GROQ_API_KEY) && (env.OPENAI_API_KEY || env.GROQ_API_KEY)) {
    try {
      const client = getOpenAIClient();
      const modelName = env.GROQ_API_KEY
        ? 'llama-3.3-70b-versatile'
        : env.OPENAI_MODEL || 'gpt-4o-mini';

      logger.rag('LLM', `Calling OpenAI-compatible API (${modelName})...`);
      const completion = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      });

      const text = completion.choices[0]?.message?.content || '';
      const responseTimeMs = Date.now() - startTime;

      return {
        answer: text.trim(),
        provider: env.GROQ_API_KEY ? 'groq' : 'openai',
        model: modelName,
        responseTimeMs,
        fallbackUsed: false,
      };
    } catch (err) {
      logger.warn(`OpenAI/Groq generation failed (${err.message}). Falling back.`);
    }
  }

  // 3. Built-in Grounded Fallback Engine
  logger.rag('LLM', 'Generating grounded answer via CollegeGPT Local Engine');
  const answer = generateLocalGroundedAnswer(question, retrievedChunks);
  const responseTimeMs = Date.now() - startTime;

  return {
    answer,
    provider: 'local-engine',
    model: 'grounded-rag-synthesizer',
    responseTimeMs,
    fallbackUsed: true,
  };
}
