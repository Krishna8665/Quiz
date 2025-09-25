import React from "react";

export default function Dashboard() {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Teams Added Box */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Teams Added
        </h2>
        <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {/* Content for Teams */}
          No teams added yet
        </div>
      </div>

      {/* Quiz Masters Box */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Quiz Masters
        </h2>
        <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {/* Content for Quiz Masters */}
          No quiz masters added yet
        </div>
      </div>
    </div>
  );
}
