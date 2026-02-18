import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { videoService, courseService } from "../services/api";
import Navbar from "./Navbar";

const CourseVideos = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseResponse, videosResponse] = await Promise.all([
        courseService.getCourse(courseId),
        videoService.getCourseVideos(courseId),
      ]);

      setCourse(courseResponse.data);
      setVideos(videosResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getVideoId = (url) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const calculateProgress = (video) => {
    if (!video.progress) return 0;
    if (video.progress.completed) return 100;

    const videoDurationSeconds = video.duration * 60;
    if (videoDurationSeconds === 0) return 0;

    return Math.min(
      (video.progress.watch_time / videoDurationSeconds) * 100,
      100,
    );
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

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {course?.title}
                </h1>
                <p className="text-gray-600 mt-2">Course Video Library</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                  title="Grid view"
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                  title="List view"
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
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
              <p className="text-gray-600 text-lg">No videos available yet.</p>
              <p className="text-gray-500 mt-2">
                Check back later for course videos.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const videoId = getVideoId(video.video_url);
                const progress = calculateProgress(video);

                return (
                  <div
                    key={video.id}
                    onClick={() => navigate(`/student/video/${video.id}`)}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="relative">
                      {videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-gray-400"
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

                      {/* Duration badge */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                        {video.duration} min
                      </div>

                      {/* Completion badge */}
                      {video.progress?.completed && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {video.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              progress === 100 ? "bg-green-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium flex items-center justify-center">
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
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {video.progress?.watch_time > 0
                          ? "Continue Watching"
                          : "Watch Video"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              <div className="divide-y">
                {videos.map((video) => {
                  const videoId = getVideoId(video.video_url);
                  const progress = calculateProgress(video);

                  return (
                    <div
                      key={video.id}
                      onClick={() => navigate(`/student/video/${video.id}`)}
                      className="p-4 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {videoId ? (
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-32 h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
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
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Video info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                              {video.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                            <span>•</span>
                            <span>{progress.toFixed(0)}% completed</span>
                            {video.progress?.completed && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 flex items-center">
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
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Completed
                                </span>
                              </>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="mt-2 w-64">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  progress === 100
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Play button */}
                        <div>
                          <button className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition">
                            <svg
                              className="w-6 h-6"
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
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseVideos;
