import { trpc } from '../utils/trpc';

export default function Home() {
  // Endpoint to check if data exists in database tables
  const dataCheck = trpc.health.database.useQuery();

  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gray-50">
      <main className="flex flex-col gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Status Check</h1>
          <p className="text-lg text-gray-600">
            Confirming database is connected and seeded
          </p>
        </div>
        
        {/* Database Connection Check */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Database Connection Check</h2>
          {dataCheck.data ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${dataCheck.data.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-gray-700"><strong>Status:</strong> {dataCheck.data.status}</p>
              </div>
              <p className="text-gray-700"><strong>Message:</strong> {dataCheck.data.message}</p>
              
              {dataCheck.data.status === 'success' && 'tableData' in dataCheck.data && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Database Tables Status:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <p className="text-gray-700"><strong>Courses:</strong></p>
                      <p className="text-gray-600">Count: {dataCheck.data.tableData.courses.count}</p>
                      <p className="text-gray-600">Status: {dataCheck.data.tableData.courses.exists ? '✅ Available' : '❌ Unavailable'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <p className="text-gray-700"><strong>Units:</strong></p>
                      <p className="text-gray-600">Count: {dataCheck.data.tableData.units.count}</p>
                      <p className="text-gray-600">Status: {dataCheck.data.tableData.units.exists ? '✅ Available' : '❌ Unavailable'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <p className="text-gray-700"><strong>Chunks:</strong></p>
                      <p className="text-gray-600">Count: {dataCheck.data.tableData.chunks?.count || 0}</p>
                      <p className="text-gray-600">Status: {dataCheck.data.tableData.chunks?.exists ? '✅ Available' : '❌ Unavailable'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <p className="text-gray-700"><strong>Resources:</strong></p>
                      <p className="text-gray-600">Count: {dataCheck.data.tableData.resources?.count || 0}</p>
                      <p className="text-gray-600">Status: {dataCheck.data.tableData.resources?.exists ? '✅ Available' : '❌ Unavailable'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <p className="text-gray-700"><strong>Exercises:</strong></p>
                      <p className="text-gray-600">Count: {dataCheck.data.tableData.exercises.count}</p>
                      <p className="text-gray-600">Status: {dataCheck.data.tableData.exercises.exists ? '✅ Available' : '❌ Unavailable'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {dataCheck.data.status === 'error' && 'error' in dataCheck.data && (
                <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-red-600"><strong>Error:</strong> {dataCheck.data.error}</p>
                </div>
              )}
              
              <p className="text-sm text-gray-500"><strong>Timestamp:</strong> {dataCheck.data.timestamp}</p>
            </div>
          ) : dataCheck.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <p className="text-gray-500">Checking database connection... If it's stuck, then confirm that docker is running</p>
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
      </main>
    </div>
  );
}
