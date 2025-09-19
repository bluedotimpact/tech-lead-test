import type { 
  CourseCSV, 
  UnitCSV, 
  ChunkCSV, 
  ExerciseCSV, 
  ChunkResourceCSV 
} from './csv-types';
import type { 
  NewCourse, 
  NewUnit, 
  NewChunk, 
  NewResource, 
  NewExercise 
} from '../schema';
import { 
  parseInteger, 
  cleanText, 
  parseYear, 
  generateSlug
} from './csv-parser';

/**
 * Transform CSV data into database-ready objects
 */

/**
 * Transform Course CSV data to database format
 */
export function transformCourse(csvData: CourseCSV): NewCourse {
  // Handle potential BOM in field names
  const courseName = cleanText(csvData.Course || (csvData as unknown as Record<string, unknown>)['﻿Course'] as string) || 'Untitled Course';
  const courseSlug = cleanText(csvData['Course slug']) || generateSlug(courseName);
  
  return {
    name: courseName,
    slug: courseSlug,
    description: cleanText(csvData['Short course description']),
    status: csvData.Status === 'Active' ? 'Active' : 'Active', // Default to Active
  };
}

/**
 * Transform Unit CSV data to database format
 */
export function transformUnit(csvData: UnitCSV, courseId: string): NewUnit {
  return {
    courseId,
    title: cleanText(csvData.Topic) || 'Untitled Unit',
    order: parseInteger(csvData.Order) || 1,
    duration: parseInteger(csvData['Unit duration (mins)']),
  };
}

/**
 * Transform Chunk CSV data to database format
 */
export function transformChunk(csvData: ChunkCSV, unitId: string): NewChunk {
  return {
    unitId,
    title: cleanText(csvData.Title) || 'Untitled Chunk',
    content: cleanText(csvData.Content),
    order: parseInteger(csvData.Order) || 1,
    timeMinutes: parseInteger(csvData['[*] Time (mins)']),
  };
}

/**
 * Transform ChunkResource CSV data to database format
 */
export function transformResource(csvData: ChunkResourceCSV, chunkId: string): NewResource {
  // Valid enum values for resource_type
  const validTypes: ('Article' | 'Blog' | 'Paper' | 'Website')[] = ['Article', 'Blog', 'Paper', 'Website'];
  
  // Valid enum values for resource_status
  const validStatuses: ('Core' | 'Maybe' | 'Supplementary' | 'Optional')[] = ['Core', 'Maybe', 'Supplementary', 'Optional'];

  // Get and normalize the type from CSV
  const csvTypeRaw = csvData['[>] Type'];
  const csvTypeClean = cleanText(csvTypeRaw);
  let resourceType: 'Article' | 'Blog' | 'Paper' | 'Website' = 'Article'; // Default
  
  // Check if the cleaned type is valid
  if (csvTypeClean && validTypes.includes(csvTypeClean as any)) {
    resourceType = csvTypeClean as 'Article' | 'Blog' | 'Paper' | 'Website';
  } else if (!csvTypeClean) {
    // If type is empty, try to infer from URL
    const url = cleanText(csvData['[>] URL']) || '';
    resourceType = inferTypeFromUrl(url);
  }

  // Get and normalize the status from CSV
  const csvStatusRaw = csvData.Status;
  const csvStatusClean = cleanText(csvStatusRaw);
  let resourceStatus: 'Core' | 'Maybe' | 'Supplementary' | 'Optional' = 'Core'; // Default
  
  // Check if the cleaned status is valid
  if (csvStatusClean && validStatuses.includes(csvStatusClean as any)) {
    resourceStatus = csvStatusClean as 'Core' | 'Maybe' | 'Supplementary' | 'Optional';
  }

  return {
    chunkId,
    title: cleanText(csvData['[>] Resource name']) || 'Untitled Resource',
    url: cleanText(csvData['[>] URL']) || '',
    author: cleanText(csvData['[>] Authors']),
    year: parseYear(csvData['[>] Year']),
    type: resourceType,
    timeMinutes: parseInteger(csvData['Time (mins)']),
    description: cleanText(csvData.Guide),
    order: parseInteger(csvData.Order) || 1,
    status: resourceStatus,
  };
}

/**
 * Infer resource type from URL when type is not specified
 */
function inferTypeFromUrl(url: string): 'Article' | 'Blog' | 'Paper' | 'Website' {
  if (!url) return 'Article';
  
  const lowerUrl = url.toLowerCase();
  
  // PDF files are papers
  if (lowerUrl.includes('.pdf')) {
    return 'Paper';
  }
  
  // Blog platforms
  if (lowerUrl.includes('substack.com') || 
      lowerUrl.includes('blog.') || 
      lowerUrl.includes('/blog/') ||
      lowerUrl.includes('medium.com') ||
      lowerUrl.includes('oneusefulthing.org')) {
    return 'Blog';
  }
  
  // Video/interactive content
  if (lowerUrl.includes('youtube.com') || 
      lowerUrl.includes('vimeo.com')) {
    return 'Website';
  }
  
  // Research/academic institutions typically publish articles
  if (lowerUrl.includes('openai.com') ||
      lowerUrl.includes('anthropic.com') ||
      lowerUrl.includes('.edu') ||
      lowerUrl.includes('rand.org') ||
      lowerUrl.includes('cnas.org') ||
      lowerUrl.includes('futureoflife.org')) {
    return 'Article';
  }
  
  // Default to Article for unknown domains
  return 'Article';
}

/**
 * Transform Exercise CSV data to database format
 */
export function transformExercise(csvData: ExerciseCSV, chunkId: string): NewExercise {
  return {
    chunkId,
    title: cleanText(csvData.Title) || 'Untitled Exercise',
    content: cleanText(csvData['[h] Text']) || '',
    type: cleanText(csvData.Type) || 'Free text',
    timeMinutes: parseInteger(csvData['Time (mins)']),
    order: parseInteger(csvData.Order) || 1,
  };
}

/**
 * Mapping utilities to find relationships between CSV data
 */

/**
 * Create a map of unit names to their full titles for easier lookup
 */
export function createUnitNameMap(unitData: UnitCSV[]): Map<string, UnitCSV> {
  const map = new Map<string, UnitCSV>();
  
  unitData.forEach(unit => {
    // Map by topic name
    if (unit.Topic) {
      map.set(unit.Topic.trim(), unit);
    }
    
    // Map by full course-unit name
    if (unit['[h] [*] Course-Unit']) {
      map.set(unit['[h] [*] Course-Unit'].trim(), unit);
    }
  });
  
  return map;
}

/**
 * Create a map of chunk names for easier lookup
 */
export function createChunkNameMap(chunkData: ChunkCSV[]): Map<string, ChunkCSV> {
  const map = new Map<string, ChunkCSV>();
  
  chunkData.forEach(chunk => {
    if (chunk.Title) {
      map.set(chunk.Title.trim(), chunk);
    }
  });
  
  return map;
}

/**
 * Parse unit chunks from the comma-separated string
 */
export function parseUnitChunks(chunksString: string): string[] {
  if (!chunksString || chunksString.trim() === '') {
    return [];
  }
  
  return chunksString
    .split(',')
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 0);
}

/**
 * Match chunk resource to chunk by name
 */
export function findChunkForResource(resourceData: ChunkResourceCSV, chunkNameMap: Map<string, ChunkCSV>): ChunkCSV | null {
  const chunkName = cleanText(resourceData['[>] Chunk']);
  if (!chunkName) {
    return null;
  }
  
  return chunkNameMap.get(chunkName) || null;
}

/**
 * Match exercise to chunk by name
 */
export function findChunkForExercise(exerciseData: ExerciseCSV, chunkNameMap: Map<string, ChunkCSV>): ChunkCSV | null {
  const chunkName = cleanText(exerciseData['[>] Chunk']);
  if (!chunkName) {
    return null;
  }
  
  return chunkNameMap.get(chunkName) || null;
}