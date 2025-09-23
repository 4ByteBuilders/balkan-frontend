import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  HardDrive,
  PieChart,
  Mail,
  Shield,
  Loader,
  AlertCircle,
} from "lucide-react";
import { getMe } from "@/api/objects";
import { useAuth } from "@/context/AuthContext";
// types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  Role: string;
  StorageUsed: number;
  DeduplicationStorageUsed: number;
}

export interface MeQueryResponse {
  me: User;
}
// components/ProfilePage.tsx

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isLoading, isFetching, error, data } = useQuery<
    MeQueryResponse,
    Error
  >({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: isAuthenticated, // Only run the query if the user is authenticated
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const calculateSavings = (original: number, deduplicated: number) => {
    const saved = original - deduplicated;
    const percentage = original > 0 ? (saved / original) * 100 : 0;
    return { saved, percentage };
  };

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 text-center">{error.message}</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show a prompt to log in.
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <User className="w-12 h-12 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">
            Authentication Required
          </h2>
          <p className="text-gray-600 text-center">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const user = data?.me;
  // This handles the edge case where the query is enabled but returns no data.
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900">No User Data</h2>
          <p className="text-gray-600">
            Unable to load user profile information.
          </p>
        </div>
      </div>
    );
  }

  const storageStats = calculateSavings(
    user.StorageUsed,
    user.DeduplicationStorageUsed
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-lg text-gray-600">
            Your Bault account information and storage details
          </p>
        </div>

        {/* Main Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information Card */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.username}
                  </h2>
                  <p className="text-gray-600">Bault User</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {user.Role.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Usage Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <HardDrive className="w-6 h-6 text-blue-600" />
                <span>Storage Overview</span>
              </h3>

              <div className="space-y-6">
                {/* Storage Usage Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Storage Used
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatBytes(user.DeduplicationStorageUsed)} of{" "}
                      {formatBytes(user.StorageUsed)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (user.DeduplicationStorageUsed / user.StorageUsed) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatBytes(user.StorageUsed)}
                    </p>
                    <p className="text-sm text-blue-800">Total Storage</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {formatBytes(user.DeduplicationStorageUsed)}
                    </p>
                    <p className="text-sm text-green-800">Actual Usage</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatBytes(storageStats.saved)}
                    </p>
                    <p className="text-sm text-purple-800">Space Saved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white sticky top-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <PieChart className="w-6 h-6" />
                <span>Efficiency Summary</span>
              </h3>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {storageStats.percentage.toFixed(1)}%
                  </div>
                  <p className="text-blue-200">Storage Efficiency</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Original Size</span>
                    <span className="font-semibold">
                      {formatBytes(user.StorageUsed)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Deduplicated Size</span>
                    <span className="font-semibold">
                      {formatBytes(user.DeduplicationStorageUsed)}
                    </span>
                  </div>
                  <div className="border-t border-blue-500 pt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Space Saved</span>
                      <span>{formatBytes(storageStats.saved)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/20 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-100 text-center">
                    Deduplication is saving you{" "}
                    {storageStats.percentage.toFixed(1)}% of storage space
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
