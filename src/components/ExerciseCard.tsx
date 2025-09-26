import React, { useState } from "react";

interface ExerciseCardProps {
  exercise: {
    id: string;
    title: string;
    content: string;
    type: string;
    timeMinutes: number | null;
    order: number;
  };
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const [userInput, setUserInput] = useState("");

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>

        <div className="prose prose-gray prose-lg max-w-none leading-relaxed whitespace-pre-line">
          {exercise.content}
        </div>

        {/* Check if there's additional content that might be a template or link */}
        {exercise.content.includes("template") && (
          <div className="mt-4">
            <span className="text-gray-700">Based on your scenario, use </span>
            <a href="#" className="text-blue-600 underline hover:text-blue-800">
              this template
            </a>
            <span className="text-gray-700"> to complete this exercise.</span>
          </div>
        )}

        {/* Text area for user input */}
        <div className="mt-4">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your answer here"
            className="w-full resize-none rounded-md border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={6}
          />
        </div>
      </div>
    </div>
  );
};
