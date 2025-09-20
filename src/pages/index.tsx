import { trpc } from "@/utils/trpc";

export default function Home() {
  // Endpoint to check if data exists in database tables
  const dataCheck = trpc.health.database.useQuery();

  return (
    <div className="bg-background min-h-screen gap-16 p-8 pb-20 font-sans sm:p-20">
      <main className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Status Check</h1>
          <p className="text-muted-foreground text-lg">
            Confirming database is connected and seeded
          </p>
        </div>

        {/* Database Connection Check */}
        <div className="bg-card rounded-lg border p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">Database Connection Check</h2>
          {dataCheck.data ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`h-3 w-3 rounded-full ${dataCheck.data.status === "success" ? "bg-green-500" : "bg-destructive"}`}
                ></div>
                <p>
                  <strong>Status:</strong> {dataCheck.data.status}
                </p>
              </div>
              <p>
                <strong>Message:</strong> {dataCheck.data.message}
              </p>

              {dataCheck.data.status === "success" && "tableData" in dataCheck.data && (
                <div className="mt-4">
                  <h3 className="mb-2 text-lg font-semibold">Database Tables Status:</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div className="bg-secondary rounded border p-3">
                      <p>
                        <strong>Courses:</strong>
                      </p>
                      <p className="text-muted-foreground">
                        Count: {dataCheck.data.tableData.courses.count}
                      </p>
                      <p className="text-muted-foreground">
                        Status:{" "}
                        {dataCheck.data.tableData.courses.exists
                          ? "✅ Available"
                          : "❌ Unavailable"}
                      </p>
                    </div>
                    <div className="bg-secondary rounded border p-3">
                      <p>
                        <strong>Units:</strong>
                      </p>
                      <p className="text-muted-foreground">
                        Count: {dataCheck.data.tableData.units.count}
                      </p>
                      <p className="text-muted-foreground">
                        Status:{" "}
                        {dataCheck.data.tableData.units.exists ? "✅ Available" : "❌ Unavailable"}
                      </p>
                    </div>
                    <div className="bg-secondary rounded border p-3">
                      <p>
                        <strong>Chunks:</strong>
                      </p>
                      <p className="text-muted-foreground">
                        Count: {dataCheck.data.tableData.chunks?.count || 0}
                      </p>
                      <p className="text-muted-foreground">
                        Status:{" "}
                        {dataCheck.data.tableData.chunks?.exists
                          ? "✅ Available"
                          : "❌ Unavailable"}
                      </p>
                    </div>
                    <div className="bg-secondary rounded border p-3">
                      <p>
                        <strong>Resources:</strong>
                      </p>
                      <p className="text-muted-foreground">
                        Count: {dataCheck.data.tableData.resources?.count || 0}
                      </p>
                      <p className="text-muted-foreground">
                        Status:{" "}
                        {dataCheck.data.tableData.resources?.exists
                          ? "✅ Available"
                          : "❌ Unavailable"}
                      </p>
                    </div>
                    <div className="bg-secondary rounded border p-3">
                      <p>
                        <strong>Exercises:</strong>
                      </p>
                      <p className="text-muted-foreground">
                        Count: {dataCheck.data.tableData.exercises.count}
                      </p>
                      <p className="text-muted-foreground">
                        Status:{" "}
                        {dataCheck.data.tableData.exercises.exists
                          ? "✅ Available"
                          : "❌ Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {dataCheck.data.status === "error" && "error" in dataCheck.data && (
                <div className="border-destructive/20 bg-destructive/10 mt-4 rounded border p-3">
                  <p className="text-destructive">
                    <strong>Error:</strong> {dataCheck.data.error}
                  </p>
                </div>
              )}

              <p className="text-muted-foreground text-sm">
                <strong>Timestamp:</strong> {dataCheck.data.timestamp}
              </p>
            </div>
          ) : dataCheck.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-yellow-500"></div>
              <p className="text-muted-foreground">
                Checking database connection... This should only take a second. If it's taking
                longer, there's likely an error connecting to the database. Please confirm that
                Docker is running.
              </p>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="bg-destructive h-3 w-3 rounded-full"></div>
              <p className="text-destructive">Error: Database check failed</p>
              {dataCheck.error && (
                <p className="text-destructive text-sm">({dataCheck.error.message})</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
