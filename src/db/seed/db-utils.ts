import { db } from '../index';
import { courses, units, chunks, resources, exercises } from '../schema';
import { eq, and, sql } from 'drizzle-orm';
import type { NewCourse, NewUnit, NewChunk, NewResource, NewExercise } from '../schema';

/**
 * Database utilities for seeding operations
 */

/**
 * Clear all data from the database in the correct order (respecting foreign keys)
 */
export async function clearDatabase(): Promise<void> {
  console.log('[INFO] Clearing database...');
  
  try {
    // Check if tables exist before trying to delete from them
    const tablesExist = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'courses'
      ) as tables_exist
    `);
    
    if (!tablesExist.rows[0]?.tables_exist) {
      console.log('[INFO] Tables do not exist yet, skipping clear');
      return;
    }
    
    // Delete in reverse dependency order
    await db.delete(exercises);
    await db.delete(resources);
    await db.delete(chunks);
    await db.delete(units);
    await db.delete(courses);
    
    console.log('[SUCCESS] Database cleared successfully');
  } catch (error) {
    console.error('[ERROR] Error clearing database:', error);
    throw error;
  }
}

/**
 * Insert a course and return its ID
 */
export async function insertCourse(courseData: NewCourse): Promise<string> {
  try {
    const [insertedCourse] = await db.insert(courses).values(courseData).returning({ id: courses.id });
    console.log(`[INFO] Inserted course: ${courseData.name} (${insertedCourse.id})`);
    return insertedCourse.id;
  } catch (error) {
    console.error(`[ERROR] Error inserting course ${courseData.name}:`, error);
    throw error;
  }
}

/**
 * Insert a unit and return its ID
 */
export async function insertUnit(unitData: NewUnit): Promise<string> {
  try {
    const [insertedUnit] = await db.insert(units).values(unitData).returning({ id: units.id });
    console.log(`[INFO] Inserted unit: ${unitData.title} (${insertedUnit.id})`);
    return insertedUnit.id;
  } catch (error) {
    console.error(`[ERROR] Error inserting unit ${unitData.title}:`, error);
    throw error;
  }
}

/**
 * Insert a chunk and return its ID
 */
export async function insertChunk(chunkData: NewChunk): Promise<string> {
  try {
    const [insertedChunk] = await db.insert(chunks).values(chunkData).returning({ id: chunks.id });
    console.log(`[INFO] Inserted chunk: ${chunkData.title} (${insertedChunk.id})`);
    return insertedChunk.id;
  } catch (error) {
    console.error(`[ERROR] Error inserting chunk ${chunkData.title}:`, error);
    throw error;
  }
}

/**
 * Insert a resource and return its ID
 */
export async function insertResource(resourceData: NewResource): Promise<string> {
  try {
    const [insertedResource] = await db.insert(resources).values(resourceData).returning({ id: resources.id });
    console.log(`[INFO] Inserted resource: ${resourceData.title} (${insertedResource.id})`);
    return insertedResource.id;
  } catch (error) {
    console.error(`[ERROR] Error inserting resource ${resourceData.title}:`, error);
    throw error;
  }
}

/**
 * Insert an exercise and return its ID
 */
export async function insertExercise(exerciseData: NewExercise): Promise<string> {
  try {
    const [insertedExercise] = await db.insert(exercises).values(exerciseData).returning({ id: exercises.id });
    console.log(`[INFO] Inserted exercise: ${exerciseData.title} (${insertedExercise.id})`);
    return insertedExercise.id;
  } catch (error) {
    console.error(`[ERROR] Error inserting exercise ${exerciseData.title}:`, error);
    throw error;
  }
}

/**
 * Find a course by name
 */
export async function findCourseByName(name: string): Promise<{ id: string; name: string } | null> {
  try {
    const course = await db.select({ id: courses.id, name: courses.name })
      .from(courses)
      .where(eq(courses.name, name))
      .limit(1);
    
    return course.length > 0 ? course[0] : null;
  } catch (error) {
    console.error(`[ERROR] Error finding course ${name}:`, error);
    throw error;
  }
}

/**
 * Find a unit by title and course ID
 */
export async function findUnitByTitle(title: string, courseId: string): Promise<{ id: string; title: string } | null> {
  try {
    const unit = await db.select({ id: units.id, title: units.title })
      .from(units)
      .where(and(eq(units.title, title), eq(units.courseId, courseId)))
      .limit(1);
    
    return unit.length > 0 ? unit[0] : null;
  } catch (error) {
    console.error(`[ERROR] Error finding unit ${title}:`, error);
    throw error;
  }
}

/**
 * Find a chunk by title and unit ID
 */
export async function findChunkByTitle(title: string, unitId: string): Promise<{ id: string; title: string } | null> {
  try {
    const chunk = await db.select({ id: chunks.id, title: chunks.title })
      .from(chunks)
      .where(and(eq(chunks.title, title), eq(chunks.unitId, unitId)))
      .limit(1);
    
    return chunk.length > 0 ? chunk[0] : null;
  } catch (error) {
    console.error(`[ERROR] Error finding chunk ${title}:`, error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  courses: number;
  units: number;
  chunks: number;
  resources: number;
  exercises: number;
}> {
  try {
    // Get actual counts
    const coursesResult = await db.select().from(courses);
    const unitsResult = await db.select().from(units);
    const chunksResult = await db.select().from(chunks);
    const resourcesResult = await db.select().from(resources);
    const exercisesResult = await db.select().from(exercises);

    return {
      courses: coursesResult.length,
      units: unitsResult.length,
      chunks: chunksResult.length,
      resources: resourcesResult.length,
      exercises: exercisesResult.length,
    };
  } catch (error) {
    console.error('[ERROR] Error getting database stats:', error);
    throw error;
  }
}