import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export function CreatePostButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const createPost = api.post.create.useMutation({
    onSuccess: (newPost: { id: string }) => {
      void router.push(`/post/${newPost?.id ?? ""}?edit=true`);
    },
  });

  const handleClick = () => {
    if (!session) {
      void router.push("/signin");
    } else {
      createPost.mutate({ title: "Untitled", content: "New post content" });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 rounded-full bg-blue-500 p-4 text-white shadow-lg hover:bg-blue-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </button>
  );
}
