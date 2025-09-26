import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background min-h-screen gap-16 p-8 pb-20 font-sans sm:p-20">
      <main className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Tech Lead Work Test</h1>
          <p className="text-muted-foreground text-lg">
            Check your database connection{" "}
            <Link href="/database" className="text-blue-500 hover:underline">
              here
            </Link>
            .
          </p>
          <p className="text-muted-foreground text-lg">View and manage the database from Drizzle Studio: <code>npm run db:studio</code>.</p>
        </div>
      </main>  
    </div>
  );
}
