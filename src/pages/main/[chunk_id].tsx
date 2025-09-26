import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Main() {
  const router = useRouter();
  const { chunk_id } = router.query;

  const { data: chunk, isLoading: isLoadingChunk } = trpc.chunks.getById.useQuery(
    chunk_id as string
  );

  const { data: unit, isLoading: isLoadingUnit } = trpc.units.getById.useQuery(
    chunk?.unitId as string,
    {
      enabled: !!chunk?.unitId,
    }
  );

  useEffect(() => {
    // Redirect to home page if chunk doesn't exist after loading
    if (!isLoadingChunk && !chunk && chunk_id) {
      router.push("/");
    }
  }, [isLoadingChunk, chunk, chunk_id, router]);

  const handlePreview = () => {
    window.open(`/preview/${chunk_id}`, "_blank");
  };

  // Show loading while fetching data
  if (isLoadingChunk || (chunk && isLoadingUnit)) {
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
      <div className="mx-auto flex max-w-4xl flex-row justify-between px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 text-sm font-medium tracking-wide text-blue-600 uppercase">
            UNIT {unit.order}: {unit.title}
          </div>
          <h1 className="mb-6 text-3xl font-bold text-gray-900">{chunk.title}</h1>
        </div>
        <div>
          <button
            onClick={handlePreview}
            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}
