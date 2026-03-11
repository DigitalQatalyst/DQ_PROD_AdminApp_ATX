import React, { useState, useEffect } from "react";
import Icon from "../../../components/ui/AppIcon";
import Button from "../../../components/ui/ButtonComponent";
import { API_BASE_URL } from "../../../api/analytics/config";

interface EfficiencyMatrixHeatmapProps {
  benchmarkType?: string;
  businessSize?: string;
  fromDate?: string;
  toDate?: string;
  year?: string;
}

const EfficiencyMatrixHeatmap = ({
  benchmarkType = "standard",
  businessSize = "all",
  fromDate,
  toDate,
  year,
}: EfficiencyMatrixHeatmapProps) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [matrixView, setMatrixView] = useState("efficiency"); // efficiency, sla
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch performance matrix data from API
  useEffect(() => {
    const fetchPerformanceMatrix = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (
          benchmarkType &&
          benchmarkType !== "all" &&
          benchmarkType !== "standard"
        ) {
          params.append("serviceType", benchmarkType);
        }
        if (businessSize && businessSize !== "all") {
          params.append("businessSize", businessSize);
        }
        if (year && /^\d{4}$/.test(year)) {
          params.append("year", year);
        }
        const query = params.toString();
        const url = `${API_BASE_URL}/api/accounts/providers/performance-matrix${query ? `?${query}` : ""}`;
        console.log(
          "[EfficiencyMatrixHeatmap] Fetching performance matrix from:",
          url,
        );
        const response = await fetch(url);

        if (!response.ok) {
          console.error(
            "[EfficiencyMatrixHeatmap] Error response:",
            response.status,
            response.statusText,
          );
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("[EfficiencyMatrixHeatmap] Response received:", result);

        if (result.success && result.data) {
          setApiData(result.data);
        } else {
          console.warn(
            "[EfficiencyMatrixHeatmap] Response not successful or missing data:",
            result,
          );
        }
      } catch (error) {
        console.error(
          "[EfficiencyMatrixHeatmap] Failed to fetch performance matrix:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceMatrix();
  }, [benchmarkType, businessSize, fromDate, toDate, year]);

  // Transform API data to matrix format
  const transformApiData = (data) => {
    return {
      efficiency: data.map((item) => ({
        partner: item.providerName,
        category: item.serviceType,
        value: item.efficiencyIndex,
        volume: item.caseCount,
        benchmark: 85, // Default benchmark
        slaPercent: item.slaPercent,
        avgResponseHrs: item.avgResponseHrs,
        avgCompletionDays: item.avgCompletionDays,
        band: item.band,
      })),
      sla: data.map((item) => ({
        partner: item.providerName,
        category: item.serviceType,
        value: item.avgCompletionDays,
        volume: item.caseCount,
        benchmark: 5, // Default SLA benchmark in days
        slaPercent: item.slaPercent,
        efficiencyIndex: item.efficiencyIndex,
        band: item.band,
      })),
    };
  };

  // Partner efficiency matrix data (fallback)
  const fallbackMatrixData = {
    efficiency: [
      {
        partner: "ADCB",
        category: "Financing & Loans",
        value: 98.5,
        volume: 127,
        benchmark: 95,
      },
      {
        partner: "ADCB",
        category: "Credit Enablement",
        value: 96.8,
        volume: 89,
        benchmark: 90,
      },
      {
        partner: "ADCB",
        category: "Equity/Investment",
        value: 94.2,
        volume: 34,
        benchmark: 85,
      },
      {
        partner: "FAB",
        category: "Financing & Loans",
        value: 95.2,
        volume: 134,
        benchmark: 95,
      },
      {
        partner: "FAB",
        category: "Credit Enablement",
        value: 93.7,
        volume: 67,
        benchmark: 90,
      },
      {
        partner: "FAB",
        category: "Grants/Subsidies",
        value: 97.1,
        volume: 45,
        benchmark: 88,
      },
      {
        partner: "Flat6Labs",
        category: "Incubation/Acceleration",
        value: 97.8,
        volume: 89,
        benchmark: 90,
      },
      {
        partner: "Flat6Labs",
        category: "Advisory & Mentorship",
        value: 95.6,
        volume: 76,
        benchmark: 85,
      },
      {
        partner: "Flat6Labs",
        category: "Training & Capacity",
        value: 94.3,
        volume: 52,
        benchmark: 82,
      },
      {
        partner: "ADCCI",
        category: "Market Access",
        value: 96.9,
        volume: 156,
        benchmark: 88,
      },
      {
        partner: "ADCCI",
        category: "Advisory & Mentorship",
        value: 93.4,
        volume: 98,
        benchmark: 85,
      },
      {
        partner: "ADCCI",
        category: "Specialist Clinics",
        value: 95.7,
        volume: 87,
        benchmark: 80,
      },
      {
        partner: "AUB",
        category: "Training & Capacity",
        value: 94.6,
        volume: 78,
        benchmark: 82,
      },
      {
        partner: "AUB",
        category: "Advisory & Mentorship",
        value: 92.8,
        volume: 65,
        benchmark: 85,
      },
      {
        partner: "AUB",
        category: "Specialist Clinics",
        value: 91.5,
        volume: 43,
        benchmark: 80,
      },
      {
        partner: "RAKBANK",
        category: "Financing & Loans",
        value: 93.8,
        volume: 92,
        benchmark: 95,
      },
      {
        partner: "RAKBANK",
        category: "Credit Enablement",
        value: 91.2,
        volume: 56,
        benchmark: 90,
      },
      {
        partner: "RAKBANK",
        category: "Grants/Subsidies",
        value: 94.9,
        volume: 38,
        benchmark: 88,
      },
    ],
    sla: [
      {
        partner: "ADCB",
        category: "Financing & Loans",
        value: 6.8,
        volume: 127,
        benchmark: 7.2,
      },
      {
        partner: "ADCB",
        category: "Credit Enablement",
        value: 5.2,
        volume: 89,
        benchmark: 5.8,
      },
      {
        partner: "ADCB",
        category: "Equity/Investment",
        value: 11.5,
        volume: 34,
        benchmark: 12.5,
      },
      {
        partner: "FAB",
        category: "Financing & Loans",
        value: 7.5,
        volume: 134,
        benchmark: 7.2,
      },
      {
        partner: "FAB",
        category: "Credit Enablement",
        value: 6.1,
        volume: 67,
        benchmark: 5.8,
      },
      {
        partner: "FAB",
        category: "Grants/Subsidies",
        value: 3.8,
        volume: 45,
        benchmark: 4.2,
      },
      {
        partner: "Flat6Labs",
        category: "Incubation/Acceleration",
        value: 8.2,
        volume: 89,
        benchmark: 9.5,
      },
      {
        partner: "Flat6Labs",
        category: "Advisory & Mentorship",
        value: 1.8,
        volume: 76,
        benchmark: 2.1,
      },
      {
        partner: "Flat6Labs",
        category: "Training & Capacity",
        value: 4.9,
        volume: 52,
        benchmark: 5.3,
      },
      {
        partner: "ADCCI",
        category: "Market Access",
        value: 4.2,
        volume: 156,
        benchmark: 4.7,
      },
      {
        partner: "ADCCI",
        category: "Advisory & Mentorship",
        value: 2.5,
        volume: 98,
        benchmark: 2.1,
      },
      {
        partner: "ADCCI",
        category: "Specialist Clinics",
        value: 1.5,
        volume: 87,
        benchmark: 1.8,
      },
      {
        partner: "AUB",
        category: "Training & Capacity",
        value: 5.8,
        volume: 78,
        benchmark: 5.3,
      },
      {
        partner: "AUB",
        category: "Advisory & Mentorship",
        value: 2.7,
        volume: 65,
        benchmark: 2.1,
      },
      {
        partner: "AUB",
        category: "Specialist Clinics",
        value: 2.1,
        volume: 43,
        benchmark: 1.8,
      },
      {
        partner: "RAKBANK",
        category: "Financing & Loans",
        value: 8.1,
        volume: 92,
        benchmark: 7.2,
      },
      {
        partner: "RAKBANK",
        category: "Credit Enablement",
        value: 6.8,
        volume: 56,
        benchmark: 5.8,
      },
      {
        partner: "RAKBANK",
        category: "Grants/Subsidies",
        value: 4.5,
        volume: 38,
        benchmark: 4.2,
      },
    ],
  };

  // Use API data if available, otherwise fallback to mock data
  const matrixData =
    apiData.length > 0 ? transformApiData(apiData) : fallbackMatrixData;
  const currentData = matrixData?.[matrixView] || matrixData?.efficiency;

  const partners = [...new Set(currentData?.map((item) => item?.partner))];
  const categories = [...new Set(currentData?.map((item) => item?.category))];

  const getValueColor = (value, benchmark, viewType) => {
    let performanceRatio;

    if (viewType === "sla") {
      // For SLA (lower is better)
      performanceRatio = benchmark / value;
    } else {
      // For efficiency (higher is better)
      performanceRatio = value / benchmark;
    }

    if (performanceRatio >= 1.1) return "bg-emerald-500"; // Excellent
    if (performanceRatio >= 1.05) return "bg-emerald-400"; // Very Good
    if (performanceRatio >= 1.0) return "bg-green-400"; // Good
    if (performanceRatio >= 0.95) return "bg-yellow-400"; // Acceptable
    if (performanceRatio >= 0.9) return "bg-orange-400"; // Below Par
    return "bg-red-400"; // Poor
  };

  const getCellData = (partner, category) => {
    return currentData?.find(
      (item) => item?.partner === partner && item?.category === category,
    );
  };

  const formatValue = (value, viewType) => {
    if (viewType === "efficiency") return `${value}%`;
    if (viewType === "sla") return `${value}d`;
    return value;
  };

  const getMetricLabel = () => {
    switch (matrixView) {
      case "efficiency":
        return "Efficiency Score";
      case "sla":
        return "SLA Performance";
      default:
        return "Performance";
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-muted-foreground">
            Loading performance matrix...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-card-foreground truncate">
            Service Provider Performance Matrix
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {getMetricLabel()} heatmap across partner types and service
            categories
          </p>
        </div>

        {/* Matrix View Controls */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg overflow-x-auto scrollbar-hide">
          <Button
            variant={matrixView === "efficiency" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMatrixView("efficiency")}
            className={`px-3 py-1 text-xs whitespace-nowrap ${
              matrixView === "efficiency"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : ""
            }`}
          >
            Efficiency
          </Button>
          <Button
            variant={matrixView === "sla" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMatrixView("sla")}
            className={`px-3 py-1 text-xs whitespace-nowrap ${
              matrixView === "sla"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : ""
            }`}
          >
            SLA
          </Button>
        </div>
      </div>

      {/* Legend moved to top with Horizontal Scroll */}
      <div className="overflow-x-auto scrollbar-hide mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
            <span className="text-sm font-semibold text-card-foreground whitespace-nowrap mr-2">
              Performance vs Benchmark:
            </span>
            <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1 bg-muted rounded">
              <div className="w-5 h-5 bg-emerald-500 rounded flex-shrink-0"></div>
              <span className="text-xs font-medium text-muted-foreground">
                Excellent
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1 bg-muted rounded">
              <div className="w-5 h-5 bg-green-400 rounded flex-shrink-0"></div>
              <span className="text-xs font-medium text-muted-foreground">
                Good
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1 bg-muted rounded">
              <div className="w-5 h-5 bg-yellow-400 rounded flex-shrink-0"></div>
              <span className="text-xs font-medium text-muted-foreground">
                Acceptable
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1 bg-muted rounded">
              <div className="w-5 h-5 bg-orange-400 rounded flex-shrink-0"></div>
              <span className="text-xs font-medium text-muted-foreground">
                Below Par
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1 bg-muted rounded">
              <div className="w-5 h-5 bg-red-400 rounded flex-shrink-0"></div>
              <span className="text-xs font-medium text-muted-foreground">
                Poor
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Icon
                name="MousePointer"
                size={16}
                className="flex-shrink-0 text-blue-600"
              />
              <span>Click cells for details</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Icon
                name="Activity"
                size={16}
                className="flex-shrink-0 text-green-600"
              />
              <span>Real-time performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Heatmap with Enhanced Scroll */}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] mb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 border border-border rounded-lg">
        <div className="inline-block min-w-full">
          {/* Headers */}
          <div
            className="grid gap-2 mb-2 sticky top-0 bg-white z-40 shadow-md pb-2"
            style={{
              gridTemplateColumns: `minmax(180px, 220px) repeat(${categories?.length}, minmax(150px, 180px))`,
            }}
          >
            <div className="p-3 bg-white border-r border-border sticky left-0 z-40"></div>
            {categories?.map((category, index) => (
              <div
                key={index}
                className="p-3 text-xs font-semibold text-muted-foreground text-center bg-white border-r border-border last:border-r-0"
              >
                <div className="leading-tight break-words min-h-[40px] flex items-center justify-center">
                  {category}
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {partners?.map((partner, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-2 mb-2"
              style={{
                gridTemplateColumns: `minmax(180px, 220px) repeat(${categories?.length}, minmax(150px, 180px))`,
              }}
            >
              {/* Partner Name */}
              <div className="p-4 bg-white rounded-lg flex items-center sticky left-0 z-30 border-r-2 border-border shadow-lg">
                <div className="min-w-0 w-full bg-gray-50 p-2 rounded border border-gray-200">
                  <div className="text-sm font-semibold text-card-foreground mb-1 break-words">
                    {partner}
                  </div>
                  <div className="text-xs text-muted-foreground break-words">
                    {partner?.includes("Labs") ||
                    partner?.includes("ADCCI") ||
                    partner?.includes("AUB")
                      ? "Capability"
                      : "Financial"}
                  </div>
                </div>
              </div>

              {/* Performance Cells */}
              {categories?.map((category, colIndex) => {
                const cellData = getCellData(partner, category);

                return (
                  <div
                    key={colIndex}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-10 hover:shadow-lg ${
                      cellData
                        ? getValueColor(
                            cellData?.value,
                            cellData?.benchmark,
                            matrixView,
                          )
                        : "bg-gray-100"
                    } ${selectedCell === `${partner}-${category}` ? "ring-2 ring-primary shadow-lg" : ""} min-h-[80px] flex items-center justify-center`}
                    onClick={() =>
                      setSelectedCell(
                        cellData ? `${partner}-${category}` : null,
                      )
                    }
                  >
                    {cellData ? (
                      <div className="text-center w-full">
                        <div className="text-base font-bold text-white mb-1 break-words">
                          {formatValue(cellData?.value, matrixView)}
                        </div>
                        <div className="text-xs text-white opacity-90 break-words">
                          Vol: {cellData?.volume}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center w-full">
                        <div className="text-xs text-gray-400">N/A</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Cell Details */}
      {selectedCell && (
        <div className="p-4 bg-muted rounded-lg mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Icon
              name="Info"
              size={16}
              className="text-blue-600 flex-shrink-0"
            />
            <span className="font-medium text-card-foreground">
              Performance Details
            </span>
          </div>
          {(() => {
            const cellData = currentData?.find(
              (item) => `${item?.partner}-${item?.category}` === selectedCell,
            );
            if (!cellData) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">
                    Partner & Service
                  </div>
                  <div className="font-medium text-card-foreground truncate">
                    {cellData?.partner}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {cellData?.category}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">
                    Current vs Benchmark
                  </div>
                  <div className="font-medium text-card-foreground truncate">
                    {formatValue(cellData?.value, matrixView)} vs{" "}
                    {formatValue(cellData?.benchmark, matrixView)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {matrixView === "sla"
                      ? cellData?.value <= cellData?.benchmark
                        ? "Meeting SLA"
                        : "SLA Breach"
                      : cellData?.value >= cellData?.benchmark
                        ? "Above Benchmark"
                        : "Below Benchmark"}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">
                    Service Volume
                  </div>
                  <div className="font-medium text-card-foreground">
                    {cellData?.volume} services
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This period
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default EfficiencyMatrixHeatmap;
