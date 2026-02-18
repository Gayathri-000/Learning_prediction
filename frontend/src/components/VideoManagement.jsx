import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { videoService, courseService } from "../services/api";
import Navbar from "./Navbar";
import ConfirmDialog from "./ConfirmDialog";

const VideoManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    videoId: null,
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    duration: 0,
  });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseResponse, videosResponse, statsResponse] = await Promise.all(
        [
          courseService.getCourse(courseId),
          videoService.getCourseVideos(courseId),
          videoService.getVideoStats(courseId),
        ],
      );

      setCourse(courseResponse.data);
      setVideos(videosResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingVideo) {
        await videoService.updateVideo(editingVideo.id, formData);
        setSuccess("Video updated successfully!");
      } else {
        await videoService.createVideo({
          ...formData,
          course_id: parseInt(courseId),
        });
        setSuccess("Video added successfully!");
      }

      setTimeout(() => setSuccess(""), 3000);
      setFormData({ title: "", description: "", video_url: "", duration: 0 });
      setShowAddForm(false);
      setEditingVideo(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save video");
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      video_url: video.video_url,
      duration: video.duration,
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (videoId) => {
    setConfirmDialog({ isOpen: true, videoId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await videoService.deleteVideo(confirmDialog.videoId);
      setSuccess("Video deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete video");
    } finally {
      setConfirmDialog({ isOpen: false, videoId: null });
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingVideo(null);
    setFormData({ title: "", description: "", video_url: "", duration: 0 });
  };

  const getVideoId = (url) => {
    // Extract video ID for YouTube/Vimeo for thumbnail
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading videos...</p>
          </div>
        </div>
      </>
    );
  }

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

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {course?.title}
                </h1>
                <p className="text-gray-600 mt-2">Video Library Management</p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium flex items-center"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {showAddForm ? "Cancel" : "Add Video"}
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingVideo ? "Edit Video" : "Add New Video"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Introduction to Neural Networks"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Brief description of the video content..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) =>
                      setFormData({ ...formData, video_url: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supports YouTube, Vimeo, and direct video links
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    placeholder="e.g., 15"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                  >
                    {editingVideo ? "Update Video" : "Add Video"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">
              Course Videos ({videos.length})
            </h2>

            {videos.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">No videos added yet.</p>
                <p className="text-gray-500 mt-2">
                  Click "Add Video" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => {
                  const videoId = getVideoId(video.video_url);
                  const videoStats = stats.find((s) => s.video_id === video.id);

                  return (
                    <div
                      key={video.id}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex space-x-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {videoId ? (
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-40 h-24 object-cover rounded"
                            />
                          ) : (
                            <div className="w-40 h-24 bg-gray-200 rounded flex items-center justify-center">
                              <svg
                                className="w-12 h-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Video Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-gray-600 text-sm mb-2">
                              {video.description}
                            </p>
                          )}
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {video.duration} min
                            </span>
                            {videoStats && (
                              <>
                                <span>•</span>
                                <span>
                                  {videoStats.students_watched}/
                                  {videoStats.total_students} watched
                                </span>
                                <span>•</span>
                                <span>
                                  {videoStats.completion_rate.toFixed(0)}%
                                  completed
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(video)}
                            className="text-blue-500 hover:text-blue-700 p-2"
                            title="Edit video"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(video.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Delete video"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Video"
        message="Are you sure you want to delete this video? All student progress will be lost. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, videoId: null })}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default VideoManagement;
