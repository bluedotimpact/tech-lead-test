import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const { data: chunksData, isLoading } = trpc.chunks.getAll.useQuery();

  const handlePreview = (chunkId: string) => {
    window.open(`/preview/${chunkId}`, "_blank");
  };

  const handleEdit = (chunkId: string) => {
    router.push(`/chunk/${chunkId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading chunks...</div>
      </div>
    );
  }

  if (!chunksData || chunksData.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">No chunks available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Tech Lead Work Test</h1>
          <p className="text-muted-foreground text-lg">
            Check your database connection{" "}
            <Link href="/database" className="text-blue-500 hover:underline">
              here
            </Link>
            . View and manage the database from Drizzle Studio: <code>npm run db:studio</code>.
          </p>
        </div>

        {/* Chunks List */}
        <div className="space-y-4">
          {chunksData.map(({ chunk, unit }) => (
            <div key={chunk.id} className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="mb-2 text-xl font-semibold text-gray-900">{chunk.title}</h2>
                  <div className="text-muted-foreground text-sm">
                    <span>
                      Unit {unit.order}: {unit.title}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Chunk {chunk.order}</span>
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handlePreview(chunk.id)}
                    className="rounded-md border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleEdit(chunk.id)}
                    className="rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Edit →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
