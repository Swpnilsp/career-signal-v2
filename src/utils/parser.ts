// Server-side PDF and DOCX text extraction utilities
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts plain text from a PDF Buffer
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text || '';
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document.');
  }
}

/**
 * Extracts plain text from a DOCX Buffer
 */
export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse Word document.');
  }
}
