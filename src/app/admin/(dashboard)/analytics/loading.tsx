export default function AnalyticsLoading() {
  return (
    <div className="p-8">
      <div className="h-8 w-32 bg-gray-800 rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 p-5 rounded h-20 animate-pulse" />
        ))}
      </div>
      <div className="h-8 bg-gray-900 rounded mb-6 animate-pulse" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded p-5 h-64 animate-pulse" />
        <div className="bg-gray-900 border border-gray-800 rounded p-5 h-64 animate-pulse" />
      </div>
    </div>
  );
}
