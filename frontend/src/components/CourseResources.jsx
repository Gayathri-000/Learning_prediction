import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resourceService, courseService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import ConfirmDialog from "./ConfirmDialog";

const CourseResources = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    file_url: "",
    file_type: "document",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    id: null,
  });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseResponse, resourcesResponse] = await Promise.all([
        courseService.getCourse(courseId),
        resourceService.getResources(courseId),
      ]);
      setCourse(courseResponse.data);
      setResources(resourcesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await resourceService.createResource({
        ...newResource,
        course_id: parseInt(courseId),
      });
      setSuccess("Resource uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setNewResource({
        title: "",
        description: "",
        file_url: "",
        file_type: "document",
      });
      setShowUploadForm(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload resource");
    }
  };

  const handleResourceClick = async (resourceId, fileUrl) => {
    if (user.role === "student") {
      try {
        await resourceService.trackClick(resourceId);
        window.open(fileUrl, "_blank");
      } catch (err) {
        console.error("Error tracking click:", err);
        window.open(fileUrl, "_blank"); // Open anyway
      }
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  const handleDeleteResource = async () => {
    try {
      await resourceService.deleteResource(confirmDialog.id);
      setSuccess("Resource deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete resource");
    } finally {
      setConfirmDialog({ isOpen: false, id: null });
    }
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return (
          <svg
            className="w-8 h-8 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        );
      case "video":
        return (
          <svg
            className="w-8 h-8 text-purple-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case "link":
        return (
          <svg
            className="w-8 h-8 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        );
      default:
        return (
          <svg
            className="w-8 h-8 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
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
                <p className="text-gray-600 mt-2">Course Resources</p>
              </div>
              {user.role === "teacher" && (
                <button
                  onClick={() => setShowUploadForm(!showUploadForm)}
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Resource
                </button>
              )}
            </div>
          </div>

          {showUploadForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Upload New Resource
              </h2>
              <form onSubmit={handleCreateResource}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) =>
                      setNewResource({ ...newResource, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Week 5 Lecture Notes"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Brief description of the resource..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Resource URL
                  </label>
                  <input
                    type="url"
                    value={newResource.file_url}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        file_url: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Resource Type
                  </label>
                  <select
                    value={newResource.file_type}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        file_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="document">Document</option>
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="link">External Link</option>
                    <option value="slides">Slides</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                  >
                    Upload Resource
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadForm(false);
                      setNewResource({
                        title: "",
                        description: "",
                        file_url: "",
                        file_type: "document",
                      });
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-md p-12 text-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">
                  No resources uploaded yet.
                </p>
                {user.role === "teacher" && (
                  <p className="text-gray-500 mt-2">
                    Upload resources to share with your students.
                  </p>
                )}
              </div>
            ) : (
              resources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {getFileTypeIcon(resource.file_type)}
                      </div>
                      {user.role === "teacher" && (
                        <button
                          onClick={() =>
                            setConfirmDialog({ isOpen: true, id: resource.id })
                          }
                          className="text-red-500 hover:text-red-700"
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
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {resource.description}
                      </p>
                    )}

                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <span className="uppercase font-medium">
                        {resource.file_type}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{resource.click_count} views</span>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Uploaded by {resource.teacher_name} on{" "}
                      {new Date(resource.created_at).toLocaleDateString()}
                    </div>

                    <button
                      onClick={() =>
                        handleResourceClick(resource.id, resource.file_url)
                      }
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 font-medium flex items-center justify-center"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Resource
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        onConfirm={handleDeleteResource}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default CourseResources;
