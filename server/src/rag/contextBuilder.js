/**
 * Formats retrieved chunks into safe, structured context blocks for the LLM
 */
export function buildContext(chunks) {
  if (!chunks || chunks.length === 0) {
    return {
      contextText: 'NO_COLLEGE_KNOWLEDGE_BASE_MATCHES_FOUND',
      sources: [],
    };
  }

  const sources = [];
  const contextBlocks = [];

  chunks.forEach((chunk, index) => {
    const docName = chunk.metadata?.documentName || 'College Document';
    const pageNum = chunk.pageNumber || 1;
    const category = chunk.metadata?.category || 'General';
    const department = chunk.metadata?.department || 'General';
    const docId = chunk.documentId;

    // Add to sources output
    sources.push({
      documentId: docId,
      documentName: docName,
      page: pageNum,
      category,
      department,
      snippet: chunk.text.slice(0, 180) + (chunk.text.length > 180 ? '...' : ''),
      score: parseFloat((chunk.finalScore || chunk.score || 0).toFixed(3)),
    });

    // Build markdown context block
    contextBlocks.push(
      `--- SOURCE ${index + 1} ---
Document: ${docName}
Page: ${pageNum}
Category: ${category}
Department: ${department}

[EXCERPT]
${chunk.text}
[END EXCERPT]`
    );
  });

  const contextText = contextBlocks.join('\n\n');

  return {
    contextText,
    sources,
  };
}
