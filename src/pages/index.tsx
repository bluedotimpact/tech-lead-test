import { trpc } from '../utils/trpc';

export default function Home() {
  const hello = trpc.greeting.hello.useQuery({ name: 'World' });
  const sayGoodbyeMutation = trpc.greeting.sayGoodbye.useMutation();

  const handleSayGoodbye = () => {
    sayGoodbyeMutation.mutate({ name: 'World' });
  };

  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">tRPC Integration Demo</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Next.js Pages Router with tRPC - Full Type Safety
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Query Example</h2>
          {hello.data ? (
            <div className="space-y-2">
              <p><strong>Greeting:</strong> {hello.data.greeting}</p>
              <p><strong>Timestamp:</strong> {hello.data.timestamp}</p>
            </div>
          ) : hello.isLoading ? (
            <p className="text-gray-500">Loading greeting...</p>
          ) : (
            <p className="text-red-500">Error loading greeting</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Mutation Example</h2>
          <button 
            onClick={handleSayGoodbye} 
            disabled={sayGoodbyeMutation.isPending}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded"
          >
            {sayGoodbyeMutation.isPending ? 'Loading...' : 'Say Goodbye'}
          </button>
          {sayGoodbyeMutation.data && (
            <div className="mt-4 space-y-2">
              <p><strong>Message:</strong> {sayGoodbyeMutation.data.message}</p>
              <p><strong>Timestamp:</strong> {sayGoodbyeMutation.data.timestamp}</p>
            </div>
          )}
          {sayGoodbyeMutation.error && (
            <p className="mt-4 text-red-500">Error: {sayGoodbyeMutation.error.message}</p>
          )}
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">What&apos;s happening here?</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>The <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">hello</code> query automatically fetches data when the component mounts</li>
            <li>Type safety is enforced from server to client with full IntelliSense</li>
            <li>The mutation can be triggered manually and shows loading states</li>
            <li>All requests are batched and sent to <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">/api/trpc</code></li>
            <li>Zod schemas validate input data on the server</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
