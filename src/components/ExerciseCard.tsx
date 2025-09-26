import React, { useState } from 'react';

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
  const [userInput, setUserInput] = useState('');

  const formatContent = (content: string) => {
    // Split content into paragraphs and format
    return content.split('\n').map((paragraph, index) => {
      // Check if this is an italicized paragraph (starts and ends with *)
      if (paragraph.trim().startsWith('*') && paragraph.trim().endsWith('*')) {
        return (
          <p key={index} className="text-gray-600 italic mb-4">
            {paragraph.trim().slice(1, -1)}
          </p>
        );
      }
      return paragraph.trim() ? (
        <p key={index} className="mb-4">
          {paragraph}
        </p>
      ) : null;
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-gray-900">{exercise.title}</h3>
        
        <div className="text-gray-700">
          {formatContent(exercise.content)}
        </div>

        {/* Check if there's additional content that might be a template or link */}
        {exercise.content.includes('template') && (
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
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
          />
        </div>
      </div>
    </div>
  );
};
