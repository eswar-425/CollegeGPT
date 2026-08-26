import { generateEmbedding } from './rag/embeddingService.js';
import { vectorStore } from './rag/vectorService.js';

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'a', 'an', 'for', 'in', 'to', 'and', 'or', 'of', 'about', 'how', 'when',
  'where', 'who', 'which', 'can', 'i', 'you', 'me', 'my', 'do', 'does', 'are', 'give', 'tell',
]);

async function testHybrid(query) {
  await vectorStore.init();

  const queryVector = await generateEmbedding(query);
  const rawResults = await vectorStore.search(queryVector, {
    topK: 20,
    minScore: 0.01,
  });

  const queryWords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  console.log(`\nQuery: "${query}" | Extracted Keywords:`, queryWords);

  const scored = rawResults.map((chunk) => {
    let keywordScore = 0;
    const lowerText = chunk.text.toLowerCase();
    const docName = (chunk.metadata?.documentName || '').toLowerCase();
    const category = (chunk.metadata?.category || '').toLowerCase();

    for (const term of queryWords) {
      // Direct word match in text
      const regex = new RegExp(`\\b${term}`, 'gi');
      const textMatches = (lowerText.match(regex) || []).length;
      if (textMatches > 0) {
        keywordScore += Math.min(0.35, textMatches * 0.08);
      }

      // Title match
      if (docName.includes(term)) {
        keywordScore += 0.25;
      }

      // Category match
      if (category.includes(term)) {
        keywordScore += 0.20;
      }
    }

    const hybridScore = chunk.score * 0.4 + keywordScore * 0.6;

    return {
      ...chunk,
      cosineScore: chunk.score,
      keywordScore,
      finalScore: hybridScore,
    };
  });

  scored.sort((a, b) => b.finalScore - a.finalScore);
  const top = scored.slice(0, 5);

  console.log(`Top Chunks for "${query}":`);
  for (const t of top) {
    console.log(` - Score: ${t.finalScore.toFixed(3)} (Cos: ${t.cosineScore.toFixed(3)}, Key: ${t.keywordScore.toFixed(3)}) | Doc: ${t.metadata?.documentName} | Text: ${t.text.substring(0, 100)}...`);
  }
}

async function run() {
  await testHybrid('fee circulars');
  await testHybrid('fees');
  await testHybrid('What is the attendance requirement?');
  await testHybrid('Who won the world cup?');
}

run().catch(console.error);
