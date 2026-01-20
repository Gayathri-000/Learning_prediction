import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentService } from "../services/api";
import ShapWaterfallPlot from './ShapWaterfallPlot';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

const EnrollmentDetails = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchEnrollmentData();
  }, [enrollmentId]);

  const fetchEnrollmentData = async () => {
    try {
      const enrollmentResponse = await studentService.getEnrollment(
        enrollmentId
      );
      setEnrollment(enrollmentResponse.data);
      setEditData({
        avg_assignment_score: enrollmentResponse.data.avg_assignment_score,
        course_progress: enrollmentResponse.data.course_progress,
        course_views: enrollmentResponse.data.course_views,
        resource_clicks: enrollmentResponse.data.resource_clicks,
        engagement_frequency: enrollmentResponse.data.engagement_frequency,
      });

      if (enrollmentResponse.data.predicted_outcome) {
        try {
          const predictionResponse = await studentService.getPrediction(
            enrollmentId
          );
          setPrediction(predictionResponse.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          console.log("No prediction available yet");
        }
      }
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
      setError("Failed to load enrollment data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunPrediction = async () => {
    setError("");
    setPredicting(true);
    try {
      const response = await studentService.predictOutcome(enrollmentId);
      setPrediction(response.data);
      await fetchEnrollmentData();
    } catch (error) {
      console.error("Error running prediction:", error);
      setError("Failed to run prediction. Please try again.");
    } finally {
      setPredicting(false);
    }
  };

  const handleUpdateData = async () => {
    setError("");
    setSaving(true);
    try {
      await studentService.updateEnrollment(enrollmentId, editData);
      setEditing(false);
      await fetchEnrollmentData();
    } catch (error) {
      console.error("Error updating enrollment:", error);
      setError("Failed to update data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading enrollment details...</p>
          </div>
        </div>
      </>
    );
  }

  const chartData =
    prediction?.shap_values.map((item) => ({
      name: item.feature_name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      impact: Math.abs(item.shap_value),
      value: item.shap_value,
    })) || [];
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-blue-500 hover:text-blue-700 font-medium flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Enrollment Details
              </h1>
              {user.role === "teacher" && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  {editing ? "Cancel Edit" : "Edit Data"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Learning Metrics
                </h3>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Average Assignment Score (0-100)
                      </label>
                      <input
                        type="number"
                        value={editData.avg_assignment_score}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            avg_assignment_score: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Course Progress (%)
                      </label>
                      <input
                        type="number"
                        value={editData.course_progress}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            course_progress: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Course Views
                      </label>
                      <input
                        type="number"
                        value={editData.course_views}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            course_views: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Resource Clicks
                      </label>
                      <input
                        type="number"
                        value={editData.resource_clicks}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            resource_clicks: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Engagement Frequency (visits per week)
                      </label>
                      <input
                        type="number"
                        value={editData.engagement_frequency}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            engagement_frequency: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <button
                      onClick={handleUpdateData}
                      disabled={saving}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium disabled:bg-green-300"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">
                        Avg Assignment Score:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {enrollment.avg_assignment_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">
                        Course Progress:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {enrollment.course_progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">
                        Course Views:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {enrollment.course_views}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">
                        Resource Clicks:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {enrollment.resource_clicks}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">
                        Engagement Frequency:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {enrollment.engagement_frequency.toFixed(1)}/week
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Prediction
                </h3>
                {prediction ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">
                          Outcome:
                        </span>
                        <span
                          className={`font-bold text-2xl ${
                            prediction.predicted_outcome === "Pass"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {prediction.predicted_outcome}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                          Confidence:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {(prediction.prediction_probability * 100).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        This prediction is based on current learning metrics and
                        historical patterns.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 mb-4">
                      No prediction available yet
                    </p>
                    <p className="text-sm text-gray-500">
                      Run a prediction to see outcome analysis
                    </p>
                  </div>
                )}
                <button
                  onClick={handleRunPrediction}
                  disabled={predicting}
                  className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition duration-200 mt-4 font-medium disabled:bg-purple-300"
                >
                  {predicting
                    ? "Running Prediction..."
                    : prediction
                    ? "Update Prediction"
                    : "Run Prediction"}
                </button>
              </div>
            </div>
          </div>
          {prediction && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Feature Importance (SHAP Values)
                </h2>
                <p className="text-gray-600 mb-6">
                  These values explain which factors contributed most to the
                  prediction. Higher values indicate stronger positive or
                  negative impact.
                </p>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="impact"
                      fill="#8884d8"
                      name="Impact on Prediction"
                    />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Top Contributing Features:
                  </h3>
                  <div className="space-y-2">
                    {prediction.shap_values.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-700">
                          {index + 1}.{" "}
                          {item.feature_name
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <span
                          className={`font-semibold ${
                            item.shap_value > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.shap_value > 0 ? "+" : ""}
                          {item.shap_value.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <ShapWaterfallPlot 
                   shapValues={prediction.shap_values}
                   baseValue={0.5}
                   predictedValue={prediction.prediction_probability}
                   predictedOutcome={prediction.predicted_outcome}
                />
                </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Personalized Recommendations
                </h2>
                {prediction.recommendations.length === 0 ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 font-medium">
                      Excellent work! Keep up the good performance.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prediction.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 rounded-r-lg"
                      >
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-gray-700">
                          {rec.recommendation_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EnrollmentDetails;
