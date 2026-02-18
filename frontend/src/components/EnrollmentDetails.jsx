import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentService } from "../services/api";
import ShapWaterfallPlot from "./ShapWaterfallPlot";
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
      const enrollmentResponse =
        await studentService.getEnrollment(enrollmentId);
      console.log("=== ENROLLMENT DATA ===");
      console.log("Full enrollment:", enrollmentResponse.data);
      console.log("Has predicted_outcome?", enrollmentResponse.data.predicted_outcome);
      setEnrollment(enrollmentResponse.data);

      setEditData({
        avg_assignment_score: enrollmentResponse.data.avg_assignment_score,
        course_progress: enrollmentResponse.data.course_progress,
        course_views: enrollmentResponse.data.course_views,
        resource_clicks: enrollmentResponse.data.resource_clicks,
      });

      if (enrollmentResponse.data.predicted_outcome) {
        try {
          console.log("=== FETCHING PREDICTION ===");
          const predictionResponse =
            await studentService.getPrediction(enrollmentId);
          console.log("Prediction API Response:", predictionResponse);
          console.log("Prediction Data:", predictionResponse.data);
          console.log("Recommendations raw:", predictionResponse.data.recommendations);
          console.log("Recommendations type:", typeof predictionResponse.data.recommendations);
          console.log("Recommendations is array?", Array.isArray(predictionResponse.data.recommendations));
          console.log("Recommendations length:", predictionResponse.data.recommendations?.length);
          
          if (predictionResponse.data.recommendations && predictionResponse.data.recommendations.length > 0) {
            console.log("First recommendation:", predictionResponse.data.recommendations[0]);
            console.log("First rec keys:", Object.keys(predictionResponse.data.recommendations[0]));
          }
          
          setPrediction(predictionResponse.data);
        } catch (error) {
          console.error("Error fetching prediction:", error);
          console.error("Error details:", error.response?.data);
        }
      }
    } catch (err) {
      console.error("Error in fetchEnrollmentData:", err);
      setError("Failed to load enrollment data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunPrediction = async () => {
    setError("");
    setPredicting(true);
    try {
      console.log("=== RUNNING PREDICTION ===");
      console.log("Enrollment ID:", enrollmentId);
      
      const response = await studentService.predictOutcome(enrollmentId);
      
      console.log("Predict API Response:", response);
      console.log("Predict Response Data:", response.data);
      console.log("Predicted Outcome:", response.data.predicted_outcome);
      console.log("Prediction Probability:", response.data.prediction_probability);
      console.log("SHAP Values:", response.data.shap_values);
      console.log("Recommendations raw:", response.data.recommendations);
      console.log("Recommendations type:", typeof response.data.recommendations);
      console.log("Recommendations is array?", Array.isArray(response.data.recommendations));
      console.log("Recommendations count:", response.data.recommendations?.length);
      
      if (response.data.recommendations && response.data.recommendations.length > 0) {
        console.log("Sample recommendation:", response.data.recommendations[0]);
        console.log("Recommendation keys:", Object.keys(response.data.recommendations[0]));
      } else {
        console.warn("NO RECOMMENDATIONS IN RESPONSE!");
      }
      
      setPrediction(response.data);
      await fetchEnrollmentData();
    } catch (error) {
      console.error("Prediction error:", error);
      console.error("Error response:", error.response?.data);
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
    } catch {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
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
    })) || [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-blue-500 hover:text-blue-700 font-medium"
          >
            ← Back
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

              <div className="flex space-x-3">
                {user.role === "teacher" && (
                  <button
                    onClick={() => setEditing(!editing)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    {editing ? "Cancel Edit" : "Edit Data"}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Learning Metrics</h3>

                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Avg Assignment Score:
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Avg Assignment Score"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Progress:
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Course Progress"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Views:
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Course Views"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Clicks:
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Resource Clicks"
                      />
                    </div>

                    <button
                      onClick={handleUpdateData}
                      disabled={saving}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Assignment Score:</span>
                      <span className="font-semibold">{enrollment.avg_assignment_score.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course Progress:</span>
                      <span className="font-semibold">{enrollment.course_progress.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course Views:</span>
                      <span className="font-semibold">{enrollment.course_views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resource Clicks:</span>
                      <span className="font-semibold">{enrollment.resource_clicks}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Prediction</h3>

                {prediction ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Outcome:</span>
                      <span
                        className={`text-2xl font-bold ${
                          prediction.predicted_outcome === "Pass"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {prediction.predicted_outcome}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="text-xl font-semibold">
                        {(prediction.prediction_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                      This prediction is based on current learning metrics and historical patterns.
                    </div>
                    <button
                      onClick={handleRunPrediction}
                      disabled={predicting}
                      className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
                    >
                      {predicting ? "Updating..." : "Update Prediction"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleRunPrediction}
                    disabled={predicting}
                    className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
                  >
                    {predicting ? "Running..." : "Run Prediction"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Personalized Recommendations */}
          {prediction && prediction.recommendations && prediction.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Personalized Recommendations
              </h2>
              <div className="space-y-4">
                {prediction.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded"
                  >
                    <h3 className="font-semibold text-blue-900 uppercase text-sm mb-2">
                      {rec.category}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-line">{rec.recommendation_text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEBUG: Show if recommendations exist but aren't displaying */}
          {prediction && !prediction.recommendations && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <strong>Debug:</strong> Prediction exists but no recommendations found.
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(prediction, null, 2)}
              </pre>
            </div>
          )}

          {prediction && prediction.recommendations && prediction.recommendations.length === 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <strong>Debug:</strong> Recommendations array is empty.
            </div>
          )}

          {/* SHAP Visualizations */}
          {prediction && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Feature Impact Analysis
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="impact" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {prediction && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <ShapWaterfallPlot
                shapValues={prediction.shap_values}
                baseValue={0.5}
                predictedValue={prediction.prediction_probability}
                predictedOutcome={prediction.predicted_outcome}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EnrollmentDetails;