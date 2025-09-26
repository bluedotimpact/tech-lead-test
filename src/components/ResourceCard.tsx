import React from "react";

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    url: string;
    author: string | null;
    year: number | null;
    type: string;
    timeMinutes: number | null;
    description: string | null;
    order: number;
    status: string;
  };
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "";
    return `${minutes} min`;
  };

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-100"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="mb-1 font-medium text-gray-900">
            {resource.title}
            {resource.url && (
              <span className="ml-2 text-gray-400">
                <svg
                  className="inline h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </span>
            )}
          </h3>
          <div className="space-y-1">
            {resource.description && <p className="mt-2 text-gray-700">{resource.description}</p>}
            {resource.author && resource.year && (
              <p className="text-sm text-gray-400">
                {resource.author} · {resource.year} · {formatDuration(resource.timeMinutes)}
              </p>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};
