import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ResourceCard } from "@/components/ResourceCard";
import { ExerciseCard } from "@/components/ExerciseCard";

export default function Preview() {
  const router = useRouter();
  const { chunk_id } = router.query;

  const { data: chunk, isLoading: isLoadingChunk } = trpc.chunks.getById.useQuery(
    chunk_id as string,
    {
      enabled: !!chunk_id,
    }
  );

  const { data: unit, isLoading: isLoadingUnit } = trpc.units.getById.useQuery(
    chunk?.unitId as string,
    {
      enabled: !!chunk?.unitId,
    }
  );

  const { data: resources, isLoading: isLoadingResources } = trpc.resources.getAll.useQuery(
    chunk?.id as string,
    {
      enabled: !!chunk?.id,
    }
  );

  const { data: exercises, isLoading: isLoadingExercises } = trpc.exercises.getAll.useQuery(
    chunk?.id as string,
    {
      enabled: !!chunk?.id,
    }
  );

  useEffect(() => {
    // Redirect to home page if chunk doesn't exist after loading
    if (!isLoadingChunk && !chunk && chunk_id) {
      router.push("/");
    }
  }, [isLoadingChunk, chunk, chunk_id, router]);

  // Calculate total time for resources
  const calculateResourceTime = () => {
    if (!resources) return 0;
    return resources.reduce((total, resource) => total + (resource.timeMinutes || 0), 0);
  };

  // Show loading while fetching data
  if (isLoadingChunk || (chunk && (isLoadingUnit || isLoadingResources || isLoadingExercises))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // If no chunk or unit after loading, return null (redirect will handle it)
  if (!chunk || !unit) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 text-sm font-medium tracking-wide text-blue-600 uppercase">
            UNIT {unit.order}: {unit.title}
          </div>
          <h1 className="mb-6 text-3xl font-bold text-gray-900">{chunk.title}</h1>
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <div className="leading-relaxed whitespace-pre-wrap text-gray-700">{chunk.content}</div>
        </div>

        {/* Resources Section */}
        {resources && resources.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Resources ({calculateResourceTime()} mins)
            </h2>
            <div className="mt-6 space-y-4">
              {resources
                .sort((a, b) => a.order - b.order)
                .map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
            </div>
          </div>
        )}

        {/* Exercises Section */}
        {exercises && exercises.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Exercises</h2>
            <div className="space-y-6">
              {exercises
                .sort((a, b) => a.order - b.order)
                .map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
