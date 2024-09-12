import { useSession } from "next-auth/react";

export default function DebugPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Current Session</h1>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
