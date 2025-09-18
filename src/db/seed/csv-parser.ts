import { parse } from 'csv-parse';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Utility function to parse CSV files with proper handling of quotes and commas
 */
export async function parseCsvFile<T = Record<string, unknown>>(filePath: string): Promise<T[]> {
  try {
    console.log(`Reading CSV file: ${filePath}`);
    
    if (!await fs.pathExists(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    let fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Remove BOM if present
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
    }
    
    return new Promise((resolve, reject) => {
      const records: T[] = [];
      
      parse(fileContent, {
        columns: true, // Use first row as column headers
        skip_empty_lines: true,
        trim: true,
        quote: '"',
        escape: '"',
        auto_parse: false, // Keep everything as strings for now
        relax_column_count: true, // Allow inconsistent column counts
      })
      .on('readable', function(this: NodeJS.ReadableStream) {
        let record;
        while (record = this.read()) {
          records.push(record as T);
        }
      })
      .on('error', function(err) {
        console.error(`Error parsing CSV file ${filePath}:`, err);
        reject(err);
      })
      .on('end', function() {
        console.log(`Successfully parsed ${records.length} records from ${path.basename(filePath)}`);
        resolve(records);
      });
    });
  } catch (error) {
    console.error(`Error reading CSV file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Parse a string value to integer, handling empty/null values
 */
export function parseInteger(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') {
    return null;
  }
  const parsed = parseInt(value.trim(), 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Clean text content, removing extra whitespace and handling empty values
 */
export function cleanText(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') {
    return null;
  }
  return value.trim();
}

/**
 * Parse year from various formats
 */
export function parseYear(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') {
    return null;
  }
  
  const yearMatch = value.trim().match(/(\d{4})/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }
  
  return null;
}

/**
 * Generate a slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Split comma-separated values and clean them
 */
export function splitAndClean(value: string | null | undefined): string[] {
  if (!value || value.trim() === '') {
    return [];
  }
  
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}