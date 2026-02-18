/* eslint-disable no-undef */
import React from "react";

const ShapWaterfallPlot = ({
  shapValues,
  baseValue,
  predictedValue,
  predictedOutcome,
}) => {
  if (!shapValues || shapValues.length === 0) {
    return null;
  }

  // Sort by absolute SHAP value
  const sortedValues = [...shapValues].sort(
    (a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value),
  );

  // Calculate cumulative values for waterfall
  const waterfallData = sortedValues.reduce(
    (acc, item) => {
      const start = acc.cumulative;
      const end = start + item.shap_value;
      acc.data.push({
        feature: item.feature_name
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        start: start,
        end: end,
        value: item.shap_value,
        isPositive: item.shap_value > 0,
      });
      acc.cumulative = end;
      return acc;
    },
    { cumulative: baseValue || 0.5, data: [] },
  ).data;

  // Add base value and final prediction
  const fullData = [
    {
      feature: "Base Value",
      start: 0,
      end: baseValue || 0.5,
      value: baseValue || 0.5,
      isBase: true,
    },
    ...waterfallData,
    {
      feature: "Final Prediction",
      start: 0,
      end: predictedValue || cumulative,
      value: predictedValue || cumulative,
      isFinal: true,
    },
  ];

  const maxValue = Math.max(...fullData.map((d) => Math.max(d.start, d.end)));
  const minValue = Math.min(...fullData.map((d) => Math.min(d.start, d.end)));
  const range = maxValue - minValue;
  const scale = 100 / range;

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        SHAP Waterfall Plot - Prediction Breakdown
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        This plot shows how each feature pushes the prediction from the base
        value toward the final prediction.
      </p>

      <div className="space-y-3">
        {fullData.map((item, index) => {
          const left = (item.start - minValue) * scale;
          const width = Math.abs(item.end - item.start) * scale;

          return (
            <div key={index} className="relative">
              <div className="flex items-center mb-1">
                <span className="text-sm font-medium text-gray-700 w-48">
                  {item.feature}
                </span>
                <div className="flex-1 ml-4 relative h-8 bg-gray-100 rounded">
                  {/* Zero line */}
                  <div
                    className="absolute h-full border-l-2 border-gray-400"
                    style={{ left: `${(0.5 - minValue) * scale}%` }}
                  />

                  {/* Bar */}
                  <div
                    className={`absolute h-full rounded ${
                      item.isBase
                        ? "bg-gray-400"
                        : item.isFinal
                          ? predictedOutcome === "Pass"
                            ? "bg-green-500"
                            : "bg-red-500"
                          : item.isPositive
                            ? "bg-green-400"
                            : "bg-red-400"
                    } opacity-80`}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                    }}
                  />

                  {/* Value label */}
                  <div
                    className="absolute h-full flex items-center text-xs font-semibold"
                    style={{
                      left:
                        item.value >= 0
                          ? `${left + width + 1}%`
                          : `${left - 1}%`,
                      transform:
                        item.value >= 0 ? "translateX(0)" : "translateX(-100%)",
                    }}
                  >
                    {item.isBase || item.isFinal
                      ? `${(item.end * 100).toFixed(1)}%`
                      : `${item.value > 0 ? "+" : ""}${item.value.toFixed(4)}`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">
          How to Read This Plot:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <span className="font-medium">Base Value:</span> Starting
            prediction (average outcome)
          </li>
          <li>
            • <span className="font-medium text-green-700">Green bars:</span>{" "}
            Push prediction toward Pass
          </li>
          <li>
            • <span className="font-medium text-red-700">Red bars:</span> Push
            prediction toward Fail
          </li>
          <li>
            • <span className="font-medium">Final Prediction:</span> Combined
            effect of all features
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShapWaterfallPlot;
