/**
 * Type definitions for CSV data structures based on actual CSV files
 */

// Course.csv structure
export interface CourseCSV {
  Course: string;
  Status: string;
  "[>] Units": string; // Comma-separated unit names
  "Course slug": string;
  "[*] Course URL": string;
  "Record ID": string;
  "Course absolute path": string;
  "Short course description": string;
}

// Unit.csv structure
export interface UnitCSV {
  "[h] [*] Course-Unit": string;
  Topic: string;
  Description: string;
  Order: string;
  Course: string;
  Exercises: string;
  "[>] Course Status": string;
  "Unit resources": string;
  "[*] Core reading time (mins)": string;
  "Unit status": string;
  "[*] RecordID": string;
  "Unit duration (mins)": string;
  "[*] Unit URL": string;
  "Menu text": string;
  "[*] Unit number": string;
  "[*] Num: Unit title": string;
  "[*] Num core resources": string;
  "Unit podcast": string;
  "Course Title": string;
  "Course Record ID": string;
  "[>] Course slug": string;
  "Course absolute path (from Course)": string;
  "Unit absolute path": string;
  "[>] Chunks": string; // Comma-separated chunk titles
}

// Chunk.csv structure
export interface ChunkCSV {
  Title: string;
  "[>] Unit": string;
  "[>] Unit URL": string;
  Order: string;
  "[*] Time (mins)": string;
  Content: string;
  "[>] Course": string;
  "[>] Resources": string; // Comma-separated resource names
  "[>] Exercises": string; // Comma-separated exercise names
}

// Resource.csv structure
export interface ResourceCSV {
  Resource: string;
  "[>] Chunk resource": string;
  "[>] Courses": string; // Comma-separated course names
  Year: string;
}

// Exercise.csv structure
export interface ExerciseCSV {
  "Course | Unit - Prompt": string;
  Title: string;
  "[h] Text": string;
  Order: string;
  "[>] Unit": string;
  "[>] Course status": string;
  "[>] Course": string;
  "[>] Unit number": string;
  "Last modified at": string;
  Status: string;
  "[*] Record ID": string;
  "Exercise response": string;
  Type: string;
  "Multiple choice options": string;
  Answer: string;
  "[>] Course slug": string;
  "[>] Course ID": string;
  "[>] Unit ID": string;
  "[>] Chunk": string;
  "[>] Chunk ID": string;
  "Time (mins)": string;
}

// Chunk-Resource.csv structure
export interface ChunkResourceCSV {
  "Resource - Unit": string;
  "[>] URL": string;
  "Time (mins)": string;
  Status: string;
  "[>] Audio URL": string;
  "[>] Authors": string;
  "[>] Type": string;
  "[>] Year": string;
  "[>] Resource name": string;
  Order: string;
  Guide: string;
  "[>] Chunk": string;
  "[>] Course (from [>] Chunk)": string;
  "[>] Unit (from Chunk)": string;
}
