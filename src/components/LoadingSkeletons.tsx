export const KPICardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
    <div className="flex items-center justify-center h-full min-h-[120px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-xs text-gray-500">Loading...</p>
      </div>
    </div>
  </div>
);

export const ChartSkeleton = ({ height = 'h-80' }: { height?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-xl p-6 ${height} animate-pulse`}>
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Loading chart...</p>
      </div>
    </div>
  </div>
);
