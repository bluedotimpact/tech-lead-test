import { trpc } from '../utils/trpc';

export default function Home() {
  // Simple endpoint to confirm tRPC is working
  const healthCheck = trpc.health.check.useQuery();
  
  // Endpoint to check if data exists in database tables
  const dataCheck = trpc.health.database.useQuery();

  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">tRPC Status Check</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Confirming tRPC is working and database connectivity
          </p>
        </div>
        
        {/* tRPC Health Check */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">tRPC Health Check</h2>
          {healthCheck.data ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p><strong>Status:</strong> {healthCheck.data.status}</p>
              </div>
              <p><strong>Message:</strong> {healthCheck.data.message}</p>
              <p><strong>Version:</strong> {healthCheck.data.version}</p>
              <p><strong>Timestamp:</strong> {healthCheck.data.timestamp}</p>
            </div>
          ) : healthCheck.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <p className="text-gray-500">Checking tRPC health...</p>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-red-500">Error: tRPC health check failed</p>
            </div>
          )}
        </div>

        {/* Database Connection Check */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Database Connection Check</h2>
          {dataCheck.data ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${dataCheck.data.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p><strong>Status:</strong> {dataCheck.data.status}</p>
              </div>
              <p><strong>Message:</strong> {dataCheck.data.message}</p>
              
              {dataCheck.data.status === 'success' && 'tableData' in dataCheck.data && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Database Tables Status:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p><strong>Courses:</strong></p>
                      <p>Count: {dataCheck.data.tableData.courses.count}</p>
                      <p>Status: {dataCheck.data.tableData.courses.exists ? '✅ Available' : '❌ Unavailable'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p><strong>Units:</strong></p>
                      <p>Count: {dataCheck.data.tableData.units.count}</p>
                      <p>Status: {dataCheck.data.tableData.units.exists ? '✅ Available' : '❌ Unavailable'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p><strong>Exercises:</strong></p>
                      <p>Count: {dataCheck.data.tableData.exercises.count}</p>
                      <p>Status: {dataCheck.data.tableData.exercises.exists ? '✅ Available' : '❌ Unavailable'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {dataCheck.data.status === 'error' && 'error' in dataCheck.data && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-red-700 dark:text-red-300"><strong>Error:</strong> {dataCheck.data.error}</p>
                </div>
              )}
              
              <p className="text-sm text-gray-500"><strong>Timestamp:</strong> {dataCheck.data.timestamp}</p>
            </div>
          ) : dataCheck.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <p className="text-gray-500">Checking database connection...</p>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-red-500">Error: Database check failed</p>
              {dataCheck.error && (
                <p className="text-red-500 text-sm">({dataCheck.error.message})</p>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>tRPC health check confirms the tRPC setup is working properly</li>
            <li>Database connection check verifies connectivity to PostgreSQL and table existence</li>
            <li>Both endpoints use type-safe queries with full IntelliSense support</li>
            <li>Status indicators provide visual feedback on system health</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
