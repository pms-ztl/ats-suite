import logger from './logger';

/**
 * Extract plain text from a PDF buffer.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse v1.x: default export is a callable function
    const pdfParse = (await import('pdf-parse')) as unknown as {
      default: (buffer: Buffer) => Promise<{ text: string }>;
    };
    const parse = pdfParse.default ?? (pdfParse as any);
    const pdf = await parse(buffer);
    return pdf.text.trim();
  } catch (err) {
    logger.error({ err }, 'PDF text extraction failed');
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract plain text from a DOCX buffer.
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (err) {
    logger.error({ err }, 'DOCX text extraction failed');
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text from a file based on its MIME type.
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer);
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractTextFromDOCX(buffer);
  }
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8').trim();
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}
