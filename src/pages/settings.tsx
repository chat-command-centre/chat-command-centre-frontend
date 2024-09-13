import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

export default function Settings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: userData, refetch: refetchUserData } =
    api.user.getUser.useQuery();

  const updateUser = api.user.updateUser.useMutation({
    onSuccess: () => refetchUserData(),
  });

  const updateEmail = api.user.updateEmail.useMutation({
    onSuccess: () => refetchUserData(),
  });

  const updatePassword = api.user.updatePassword.useMutation();

  const deleteAccount = api.user.deleteAccount.useMutation({
    onSuccess: () => {
      // Handle successful account deletion (e.g., logout and redirect)
    },
  });

  const connectStripe = api.user.connectStripe.useMutation();

  const exportData = api.user.exportData.useMutation();

  useEffect(() => {
    if (userData) {
      setName(userData.name ?? "");
      setEmail(userData.email ?? "");
    }
  }, [userData]);

  if (!session) {
    router.push("/signin");
    return null;
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate({ name });
  };

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmail.mutate({ email });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    updatePassword.mutate({ currentPassword, newPassword });
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      deleteAccount.mutate();
    }
  };

  const handleConnectStripe = () => {
    connectStripe.mutate();
  };

  const handleExportData = () => {
    exportData.mutate(undefined, {
      onSuccess: (data) => {
        // Here you might want to generate a file for download
        const dataStr = JSON.stringify(data);
        const dataUri =
          "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = "user_data.json";
        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
      },
    });
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>

      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Profile Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="name" className="block">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="username" className="block">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={userData?.username}
              disabled
              className="w-full rounded border bg-gray-100 p-2"
            />
          </div>
          <div>
            <label htmlFor="joinDate" className="block">
              Join Date
            </label>
            <input
              type="text"
              id="joinDate"
              value={new Date(userData?.createdAt ?? "").toLocaleDateString()}
              disabled
              className="w-full rounded border bg-gray-100 p-2"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Update Profile
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Update Email</h2>
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Update Email
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Change Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Change Password
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Stripe Integration</h2>
        <button
          onClick={handleConnectStripe}
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          Connect Stripe Account
        </button>
        {/* Add a list of tips received here */}
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-red-600">Danger Zone</h2>
        <button
          onClick={handleDeleteAccount}
          className="mr-2 rounded bg-red-500 px-4 py-2 text-white"
        >
          Delete Account
        </button>
        <button
          onClick={handleExportData}
          className="rounded bg-yellow-500 px-4 py-2 text-white"
        >
          Export Data
        </button>
      </div>
    </div>
  );
}
