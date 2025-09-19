#!/usr/bin/env node

import * as path from "path";
import { parseCsvFile } from "./csv-parser";
import {
  clearDatabase,
  insertCourse,
  insertUnit,
  insertChunk,
  insertResource,
  insertExercise,
  getDatabaseStats,
} from "./db-utils";
import {
  transformCourse,
  transformUnit,
  transformChunk,
  transformResource,
  transformExercise,
  createUnitNameMap,
} from "./transformers";
import type { CourseCSV, UnitCSV, ChunkCSV, ExerciseCSV, ChunkResourceCSV } from "./csv-types";

/**
 * Main database seeding script
 */

const CSV_DIR = path.resolve(process.cwd(), "future-tables");

interface SeedingStats {
  coursesProcessed: number;
  unitsProcessed: number;
  chunksProcessed: number;
  resourcesProcessed: number;
  exercisesProcessed: number;
  errors: string[];
}

class DatabaseSeeder {
  private stats: SeedingStats = {
    coursesProcessed: 0,
    unitsProcessed: 0,
    chunksProcessed: 0,
    resourcesProcessed: 0,
    exercisesProcessed: 0,
    errors: [],
  };

  private courseIdMap = new Map<string, string>(); // course name -> course ID
  private unitIdMap = new Map<string, string>(); // unit title -> unit ID
  private chunkIdMap = new Map<string, string>(); // chunk title -> chunk ID

  async seed(clearExisting: boolean = true): Promise<void> {
    console.log("[INFO] Starting database seeding...");
    console.log(`[INFO] Reading CSV files from: ${CSV_DIR}`);

    try {
      // Clear existing data if requested
      if (clearExisting) {
        await clearDatabase();
      }

      // Load all CSV data
      const csvData = await this.loadCsvData();

      // Process in dependency order
      await this.seedCourses(csvData.courses);
      await this.seedUnits(csvData.units);
      await this.seedChunks(csvData.chunks, csvData.units);
      await this.seedResources(csvData.chunkResources);
      await this.seedExercises(csvData.exercises);

      // Report results
      await this.reportResults();
    } catch (error) {
      console.error("[ERROR] Seeding failed:", error);
      throw error;
    }
  }

  private async loadCsvData() {
    console.log("[INFO] Loading CSV data...");

    const [courses, units, chunks, exercises, chunkResources] = await Promise.all([
      parseCsvFile<CourseCSV>(path.join(CSV_DIR, "Course.csv")),
      parseCsvFile<UnitCSV>(path.join(CSV_DIR, "Unit.csv")),
      parseCsvFile<ChunkCSV>(path.join(CSV_DIR, "Chunk.csv")),
      parseCsvFile<ExerciseCSV>(path.join(CSV_DIR, "Exercise.csv")),
      parseCsvFile<ChunkResourceCSV>(path.join(CSV_DIR, "Chunk-Resource.csv")),
    ]);

    console.log(
      `[INFO] Loaded: ${courses.length} courses, ${units.length} units, ${chunks.length} chunks, ${exercises.length} exercises, ${chunkResources.length} chunk-resources`
    );

    return { courses, units, chunks, exercises, chunkResources };
  }

  private async seedCourses(coursesData: CourseCSV[]): Promise<void> {
    console.log("[INFO] Seeding courses...");

    for (const csvCourse of coursesData) {
      try {
        const courseData = transformCourse(csvCourse);
        const courseId = await insertCourse(courseData);
        this.courseIdMap.set(csvCourse.Course, courseId);
        this.stats.coursesProcessed++;
      } catch (error) {
        const errorMsg = `Failed to insert course: ${csvCourse.Course} - ${error}`;
        console.error(`[ERROR] ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }
  }

  private async seedUnits(unitsData: UnitCSV[]): Promise<void> {
    console.log("[INFO] Seeding units...");

    for (const csvUnit of unitsData) {
      try {
        const courseName = csvUnit.Course;
        const courseId = this.courseIdMap.get(courseName);

        if (!courseId) {
          throw new Error(`Course not found: ${courseName}`);
        }

        const unitData = transformUnit(csvUnit, courseId);
        const unitId = await insertUnit(unitData);
        this.unitIdMap.set(csvUnit.Topic, unitId);
        this.stats.unitsProcessed++;
      } catch (error) {
        const errorMsg = `Failed to insert unit: ${csvUnit.Topic} - ${error}`;
        console.error(`[ERROR] ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }
  }

  private async seedChunks(chunksData: ChunkCSV[], unitsData: UnitCSV[]): Promise<void> {
    console.log("[INFO] Seeding chunks...");

    // Create unit name mapping for lookup
    const unitNameMap = createUnitNameMap(unitsData);

    for (const csvChunk of chunksData) {
      try {
        const unitName = csvChunk["[>] Unit"];

        // Find the unit for this chunk
        const matchingUnit = unitNameMap.get(unitName);
        if (!matchingUnit) {
          throw new Error(
            `Unit not found for chunk: ${csvChunk.Title} (looking for unit: ${unitName})`
          );
        }

        const unitId = this.unitIdMap.get(matchingUnit.Topic);
        if (!unitId) {
          throw new Error(`Unit ID not found: ${matchingUnit.Topic}`);
        }

        const chunkData = transformChunk(csvChunk, unitId);
        const chunkId = await insertChunk(chunkData);
        this.chunkIdMap.set(csvChunk.Title, chunkId);
        this.stats.chunksProcessed++;
      } catch (error) {
        const errorMsg = `Failed to insert chunk: ${csvChunk.Title} - ${error}`;
        console.error(`[ERROR] ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }
  }

  private async seedResources(resourcesData: ChunkResourceCSV[]): Promise<void> {
    console.log("[INFO] Seeding resources...");

    for (const csvResource of resourcesData) {
      try {
        const chunkName = csvResource["[>] Chunk"];
        const chunkId = this.chunkIdMap.get(chunkName);

        if (!chunkId) {
          throw new Error(
            `Chunk not found for resource: ${csvResource["[>] Resource name"]} (looking for chunk: ${chunkName})`
          );
        }

        const resourceData = transformResource(csvResource, chunkId);
        await insertResource(resourceData);
        this.stats.resourcesProcessed++;
      } catch (error) {
        const errorMsg = `Failed to insert resource: ${csvResource["[>] Resource name"]} - ${error}`;
        console.error(`[ERROR] ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }
  }

  private async seedExercises(exercisesData: ExerciseCSV[]): Promise<void> {
    console.log("[INFO] Seeding exercises...");

    for (const csvExercise of exercisesData) {
      try {
        const chunkName = csvExercise["[>] Chunk"];
        const chunkId = this.chunkIdMap.get(chunkName);

        if (!chunkId) {
          // Skip exercises without valid chunks
          console.log(
            `[INFO] Skipping exercise (no chunk found): ${csvExercise.Title} (chunk: ${chunkName})`
          );
          continue;
        }

        const exerciseData = transformExercise(csvExercise, chunkId);
        await insertExercise(exerciseData);
        this.stats.exercisesProcessed++;
      } catch (error) {
        const errorMsg = `Failed to insert exercise: ${csvExercise.Title} - ${error}`;
        console.error(`[ERROR] ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }
  }

  private async reportResults(): Promise<void> {
    console.log("\n[INFO] SEEDING RESULTS");
    console.log("==================");
    console.log(`[SUCCESS] Courses processed: ${this.stats.coursesProcessed}`);
    console.log(`[SUCCESS] Units processed: ${this.stats.unitsProcessed}`);
    console.log(`[SUCCESS] Chunks processed: ${this.stats.chunksProcessed}`);
    console.log(`[SUCCESS] Resources processed: ${this.stats.resourcesProcessed}`);
    console.log(`[SUCCESS] Exercises processed: ${this.stats.exercisesProcessed}`);

    if (this.stats.errors.length > 0) {
      console.log(`\n[ERROR] Errors encountered: ${this.stats.errors.length}`);
      this.stats.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // Get final database stats
    console.log("\n[INFO] FINAL DATABASE STATE");
    console.log("========================");
    const dbStats = await getDatabaseStats();
    console.log(`[INFO] Total courses: ${dbStats.courses}`);
    console.log(`[INFO] Total units: ${dbStats.units}`);
    console.log(`[INFO] Total chunks: ${dbStats.chunks}`);
    console.log(`[INFO] Total resources: ${dbStats.resources}`);
    console.log(`[INFO] Total exercises: ${dbStats.exercises}`);

    console.log("\n[SUCCESS] Seeding completed!");
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const clearExisting = !args.includes("--no-clear");

  console.log("[INFO] PostgreSQL Database Seeder");
  console.log("============================");

  if (clearExisting) {
    console.log("[INFO] Will clear existing data before seeding");
  } else {
    console.log("[INFO] Will append to existing data");
  }

  try {
    const seeder = new DatabaseSeeder();
    await seeder.seed(clearExisting);
    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Seeding failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DatabaseSeeder };
