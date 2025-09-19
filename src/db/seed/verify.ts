#!/usr/bin/env node

import { db } from "../index";
import { courses, units, chunks, resources, exercises } from "../schema";

/**
 * Verification script to check data integrity after seeding
 */

async function verifyDatabase(): Promise<void> {
  console.log("[INFO] Verifying database integrity...");

  try {
    // Get all data with relationships
    const allCourses = await db.select().from(courses);

    const allUnits = await db.select().from(units);

    const allChunks = await db.select().from(chunks);

    const allResources = await db.select().from(resources);

    const allExercises = await db.select().from(exercises);

    console.log("\n[INFO] DATABASE VERIFICATION REPORT");
    console.log("==============================");

    // Basic counts
    console.log(`[INFO] Total courses: ${allCourses.length}`);
    console.log(`[INFO] Total units: ${allUnits.length}`);
    console.log(`[INFO] Total chunks: ${allChunks.length}`);
    console.log(`[INFO] Total resources: ${allResources.length}`);
    console.log(`[INFO] Total exercises: ${allExercises.length}`);

    // Check that all tables have non-zero rows
    const tables = [
      { name: "courses", count: allCourses.length },
      { name: "units", count: allUnits.length },
      { name: "chunks", count: allChunks.length },
      { name: "resources", count: allResources.length },
      { name: "exercises", count: allExercises.length },
    ];

    const emptyTables = tables.filter((table) => table.count === 0);

    if (emptyTables.length > 0) {
      console.log("\n[ERROR] The following tables have zero rows:");
      emptyTables.forEach((table) => {
        console.log(`[ERROR] - ${table.name}: ${table.count} rows`);
      });
      console.log("[ERROR] Database verification failed - all tables must have at least one row");
      process.exit(1);
    }

    // Check for orphaned records
    console.log("\n[INFO] RELATIONSHIP INTEGRITY");
    console.log("=========================");

    let orphanedUnits = 0;
    let orphanedChunks = 0;
    let orphanedResources = 0;
    let orphanedExercises = 0;

    for (const unit of allUnits) {
      const course = allCourses.find((c) => c.id === unit.courseId);
      if (!course) {
        orphanedUnits++;
        console.log(`[ERROR] Orphaned unit: ${unit.title} (courseId: ${unit.courseId})`);
      }
    }

    for (const chunk of allChunks) {
      const unit = allUnits.find((u) => u.id === chunk.unitId);
      if (!unit) {
        orphanedChunks++;
        console.log(`[ERROR] Orphaned chunk: ${chunk.title} (unitId: ${chunk.unitId})`);
      }
    }

    for (const resource of allResources) {
      const chunk = allChunks.find((c) => c.id === resource.chunkId);
      if (!chunk) {
        orphanedResources++;
        console.log(`[ERROR] Orphaned resource: ${resource.title} (chunkId: ${resource.chunkId})`);
      }
    }

    for (const exercise of allExercises) {
      const chunk = allChunks.find((c) => c.id === exercise.chunkId);
      if (!chunk) {
        orphanedExercises++;
        console.log(`[ERROR] Orphaned exercise: ${exercise.title} (chunkId: ${exercise.chunkId})`);
      }
    }

    if (
      orphanedUnits === 0 &&
      orphanedChunks === 0 &&
      orphanedResources === 0 &&
      orphanedExercises === 0
    ) {
      console.log("[SUCCESS] All relationships are intact - no orphaned records found");
    } else {
      console.log(
        `[ERROR] Found issues: ${orphanedUnits} orphaned units, ${orphanedChunks} orphaned chunks, ${orphanedResources} orphaned resources, ${orphanedExercises} orphaned exercises`
      );
    }

    // Sample data preview
    console.log("\n[INFO] SAMPLE DATA PREVIEW");
    console.log("=====================");

    if (allCourses.length > 0) {
      const course = allCourses[0];
      console.log(`Course: ${course.name} (${course.slug})`);
      console.log(`Description: ${course.description || "No description"}`);

      const courseUnits = allUnits.filter((u) => u.courseId === course.id);
      console.log(`Units in this course: ${courseUnits.length}`);

      if (courseUnits.length > 0) {
        const unit = courseUnits[0];
        console.log(`  Unit: ${unit.title} (order: ${unit.order}, duration: ${unit.duration}min)`);

        const unitChunks = allChunks.filter((c) => c.unitId === unit.id);
        console.log(`  Chunks in this unit: ${unitChunks.length}`);

        if (unitChunks.length > 0) {
          const chunk = unitChunks[0];
          console.log(
            `    Chunk: ${chunk.title} (order: ${chunk.order}, time: ${chunk.timeMinutes}min)`
          );

          const chunkResources = allResources.filter((r) => r.chunkId === chunk.id);
          const chunkExercises = allExercises.filter((e) => e.chunkId === chunk.id);
          console.log(
            `    Resources: ${chunkResources.length}, Exercises: ${chunkExercises.length}`
          );

          if (chunkResources.length > 0) {
            const resource = chunkResources[0];
            console.log(`      Resource: ${resource.title} (${resource.type}, ${resource.status})`);
          }

          if (chunkExercises.length > 0) {
            const exercise = chunkExercises[0];
            console.log(`      Exercise: ${exercise.title} (${exercise.type})`);
          }
        }
      }
    }

    console.log("\n[SUCCESS] Database verification completed successfully!");
  } catch (error) {
    console.error("[ERROR] Verification failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  verifyDatabase().then(() => process.exit(0));
}

export { verifyDatabase };
