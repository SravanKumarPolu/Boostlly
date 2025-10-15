"use client";

import React, { useState } from "react";

interface UsersRouteProps {
  onLoad?: () => void;
}

export const UsersRoute: React.FC<UsersRouteProps> = ({ onLoad }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      lastLogin: "2 hours ago",
      avatar: "👨‍💼",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "User",
      status: "Active",
      lastLogin: "1 day ago",
      avatar: "👩‍💻",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: "Editor",
      status: "Inactive",
      lastLogin: "1 week ago",
      avatar: "👨‍🎨",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      role: "User",
      status: "Active",
      lastLogin: "3 hours ago",
      avatar: "👩‍🔬",
    },
    {
      id: "5",
      name: "David Brown",
      email: "david.brown@example.com",
      role: "Moderator",
      status: "Active",
      lastLogin: "30 minutes ago",
      avatar: "👨‍🏫",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 p-6 rounded-lg border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Filter by Role
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Filter by Status
            </button>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Users",
            value: "1,234",
            change: "+12%",
            color: "blue",
          },
          {
            label: "Active Users",
            value: "1,156",
            change: "+8%",
            color: "green",
          },
          {
            label: "New This Month",
            value: "89",
            change: "+15%",
            color: "purple",
          },
          {
            label: "Inactive Users",
            value: "78",
            change: "-2%",
            color: "orange",
          },
        ].map((stat, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {stat.label}
            </h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div
              className={`text-sm ${
                stat.color === "green"
                  ? "text-green-600"
                  : stat.color === "blue"
                    ? "text-blue-600"
                    : stat.color === "purple"
                      ? "text-purple-600"
                      : "text-orange-600"
              }`}
            >
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-gray-50 rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedUser === user.id ? "bg-purple-50" : ""
                  }`}
                  onClick={() =>
                    setSelectedUser(selectedUser === user.id ? null : user.id)
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{user.avatar}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "Admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "Editor"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "Moderator"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-purple-600 hover:text-purple-900">
                        Edit
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Panel */}
      {selectedUser && (
        <div className="mt-6 bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">
            User Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-purple-700 mb-2">
                Profile Information
              </h4>
              <div className="space-y-2 text-sm text-purple-600">
                <div>Name: John Doe</div>
                <div>Email: john.doe@example.com</div>
                <div>Role: Administrator</div>
                <div>Member since: January 2023</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-purple-700 mb-2">
                Activity Summary
              </h4>
              <div className="space-y-2 text-sm text-purple-600">
                <div>Total logins: 1,234</div>
                <div>Last login: 2 hours ago</div>
                <div>Actions today: 45</div>
                <div>Status: Active</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-green-600 mr-2">👥</span>
          <span className="text-green-800 font-medium">
            Users route loaded successfully
          </span>
        </div>
        <div className="text-green-600 text-sm mt-1">
          This user management interface was loaded on-demand using code
          splitting.
        </div>
      </div>
    </div>
  );
};
