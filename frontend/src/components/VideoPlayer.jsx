import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoService } from '../services/api';
import Navbar from './Navbar';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watchTime, setWatchTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(0); // Actual video duration from YouTube
  const [isCompleted, setIsCompleted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playerRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const trackingIntervalRef = useRef(null);
  const lastSaveTimeRef = useRef(0);

  useEffect(() => {
    fetchVideo();
    loadYouTubeAPI();
    
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      saveProgress();
    };
  }, [videoId]);

  const loadYouTubeAPI = () => {
    if (window.YT && window.YT.Player) {
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API loaded');
    };
  };

  const fetchVideo = async () => {
    try {
      const response = await videoService.getVideo(videoId);
      setVideo(response.data);
      
      if (response.data.progress) {
        setWatchTime(response.data.progress.watch_time);
        setIsCompleted(response.data.progress.completed);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      setError('Failed to load video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    
    if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      return match ? match[1] : null;
    }
    
    if (url.includes('youtube.com/watch')) {
      const match = url.match(/[?&]v=([^&]+)/);
      return match ? match[1] : null;
    }
    
    if (url.includes('youtube.com/embed/')) {
      const match = url.match(/embed\/([^?&]+)/);
      return match ? match[1] : null;
    }
    
    return null;
  };

  const extractVimeoId = (url) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const isDirectVideo = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  useEffect(() => {
    if (!video || loading) return;

    const youtubeId = extractYouTubeId(video.video_url);
    
    if (youtubeId) {
      const checkAPI = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkAPI);
          initYouTubePlayer(youtubeId);
        }
      }, 100);

      return () => clearInterval(checkAPI);
    }
  }, [video, loading]);

  const initYouTubePlayer = (youtubeId) => {
    try {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const onPlayerReady = (event) => {
    console.log('YouTube player ready');
    setPlayerReady(true);
    
    // Get ACTUAL video duration from YouTube
    if (playerRef.current && playerRef.current.getDuration) {
      const duration = playerRef.current.getDuration();
      setActualDuration(duration);
      console.log('Actual video duration:', duration, 'seconds');
      console.log('Teacher input duration:', video?.duration, 'minutes');
    }
    
    // Seek to last watched position
    if (watchTime > 0 && playerRef.current) {
      playerRef.current.seekTo(watchTime, true);
    }
  };

  const onPlayerStateChange = (event) => {
    // 1 = playing, 2 = paused
    if (event.data === 1) {
      setIsPlaying(true);
      startTracking();
    } else {
      setIsPlaying(false);
      stopTracking();
      if (event.data === 2) { // Paused
        saveProgress();
      }
    }

    // 0 = ended
    if (event.data === 0) {
      setIsCompleted(true);
      saveProgress();
    }
  };

  const startTracking = () => {
    if (trackingIntervalRef.current) return;

    trackingIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        const duration = playerRef.current.getDuration();
        
        // Update actual duration if it changed
        if (duration && duration !== actualDuration) {
          setActualDuration(duration);
        }
        
        setWatchTime(currentTime);

        // Auto-save every 5 seconds
        const now = Date.now();
        if (now - lastSaveTimeRef.current > 5000) {
          const completed = duration > 0 && (currentTime / duration) >= 0.95;
          saveProgressNow(currentTime, completed);
          lastSaveTimeRef.current = now;
        }
      }
    }, 1000);
  };

  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  };

  const saveProgressNow = async (currentTime = null, completed = null) => {
    if (!video) return;

    try {
      const timeToSave = currentTime !== null ? currentTime : watchTime;
      const completedStatus = completed !== null ? completed : isCompleted;

      await videoService.updateProgress(videoId, {
        watch_time: timeToSave,
        completed: completedStatus
      });

      console.log('Progress saved:', { watch_time: timeToSave, completed: completedStatus });

      if (completedStatus && !isCompleted) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const saveProgress = async () => {
    if (!video) return;

    let currentTime = watchTime;

    // Get current position from YouTube player if available
    if (playerRef.current && playerRef.current.getCurrentTime) {
      currentTime = Math.floor(playerRef.current.getCurrentTime());
      setWatchTime(currentTime);
    }

    try {
      // Use ACTUAL duration for completion check
      const durationToUse = actualDuration > 0 ? actualDuration : (video.duration * 60);
      const completed = isCompleted || (currentTime >= (durationToUse * 0.95));
      
      await videoService.updateProgress(videoId, {
        watch_time: currentTime,
        completed: completed
      });

      console.log('Progress saved:', { watch_time: currentTime, completed });

      if (completed && !isCompleted) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const markComplete = async () => {
    try {
      // Use actual duration for final completion
      const durationToUse = actualDuration > 0 ? actualDuration : (video.duration * 60);
      
      await videoService.updateProgress(videoId, {
        watch_time: Math.floor(durationToUse),
        completed: true
      });
      setIsCompleted(true);
      alert('Video marked as complete! ✓');
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      console.error('Error marking complete:', error);
      alert('Failed to mark video as complete');
    }
  };

  const handleDirectVideoProgress = (e) => {
    const currentTime = Math.floor(e.target.currentTime);
    const duration = e.target.duration;
    
    // Set actual duration for direct videos
    if (duration && duration !== actualDuration) {
      setActualDuration(duration);
    }
    
    setWatchTime(currentTime);

    const now = Date.now();
    if (now - lastSaveTimeRef.current > 5000) {
      const completed = duration > 0 && (currentTime / duration) >= 0.95;
      saveProgressNow(currentTime, completed);
      lastSaveTimeRef.current = now;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading video...</p>
          </div>
        </div>
      </>
    );
  }

  const youtubeId = extractYouTubeId(video?.video_url);
  const vimeoId = extractVimeoId(video?.video_url);
  const isDirect = isDirectVideo(video?.video_url);

  // Use ACTUAL duration if available, otherwise fall back to teacher's input
  const durationToUse = actualDuration > 0 ? actualDuration : (video?.duration * 60);
  
  const progressPercentage = durationToUse > 0 
    ? Math.min(Math.floor((watchTime / durationToUse) * 100), 100) 
    : 0;

  const hasWatched95Percent = progressPercentage >= 95;

  // Format duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto p-4">
          {/* Header */}
          <div className="mb-4">
            <button
              onClick={() => {
                saveProgress();
                navigate(-1);
              }}
              className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Videos
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Video Player Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Video Player */}
            <div className="relative" style={{ paddingTop: '56.25%' }}>
              <div className="absolute top-0 left-0 w-full h-full bg-black">
                {youtubeId ? (
                  <div>
                    <div id="youtube-player" className="absolute top-0 left-0 w-full h-full"></div>
                    {!playerReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
                          <p className="mt-4 text-white">Loading player...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : vimeoId ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${vimeoId}?title=1&byline=1&portrait=1`}
                    title={video?.title}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  />
                ) : isDirect ? (
                  <video
                    controls
                    className="absolute top-0 left-0 w-full h-full"
                    src={video?.video_url}
                    onTimeUpdate={handleDirectVideoProgress}
                    onLoadedMetadata={(e) => setActualDuration(e.target.duration)}
                    onEnded={() => {
                      setIsCompleted(true);
                      saveProgress();
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg">Unsupported video format</p>
                      <p className="text-sm text-gray-400 mt-2">Please use YouTube, Vimeo, or direct video links (.mp4, .webm)</p>
                      <a 
                        href={video?.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Open Video in New Tab
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{video?.title}</h1>
                  {video?.description && (
                    <p className="text-gray-600 mb-4">{video.description}</p>
                  )}
                </div>
                
                {isCompleted ? (
                  <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <button
                      onClick={markComplete}
                      disabled={!hasWatched95Percent}
                      className={`px-6 py-2 rounded-lg transition duration-200 font-medium flex items-center ${
                        hasWatched95Percent
                          ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                      }`}
                      title={!hasWatched95Percent ? 'Watch at least 95% of the video to mark as complete' : 'Mark video as complete'}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark Complete
                    </button>
                    {!hasWatched95Percent && (
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        Watch {95 - progressPercentage}% more to unlock
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Live Stats */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Current Position</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatDuration(watchTime)}
                    </p>
                    <p className="text-xs text-gray-500">
                      of {formatDuration(durationToUse)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Progress</p>
                    <p className={`text-2xl font-bold ${hasWatched95Percent ? 'text-green-600' : 'text-blue-900'}`}>
                      {progressPercentage}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {hasWatched95Percent ? 'Ready to complete!' : `${95 - progressPercentage}% to go`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Status</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {isPlaying ? (
                        <span className="text-green-600 flex items-center justify-center">
                          <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-2"></span>
                          Playing
                        </span>
                      ) : (
                        <span className="text-gray-600">Paused</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {actualDuration > 0 ? 'Using actual duration' : 'Using estimated duration'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Video Progress</span>
                  <span className={hasWatched95Percent ? 'text-green-600 font-bold' : ''}>
                    {progressPercentage}% {hasWatched95Percent && '✓'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 relative">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      isCompleted ? 'bg-green-500' : hasWatched95Percent ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                  {/* 95% marker */}
                  <div 
                    className="absolute top-0 h-3 w-0.5 bg-red-500"
                    style={{ left: '95%' }}
                    title="95% threshold"
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="text-red-600">← 95% (Required)</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center space-x-6">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Actual: {formatDuration(durationToUse)}
                  </span>

                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {youtubeId ? 'YouTube' : vimeoId ? 'Vimeo' : isDirect ? 'Direct Video' : 'Unknown'}
                  </span>

                  <span className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {actualDuration > 0 ? 'Accurate tracking' : 'Auto-saves every 5 sec'}
                  </span>
                </div>

                <button
                  onClick={saveProgress}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 font-medium flex items-center text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Now
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2"> How Progress Tracking Works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Uses actual video duration from YouTube</strong> (not teacher's rounded estimate)</li>
              <li>• Progress is calculated accurately regardless of playback speed</li>
              <li>• Position updates every second based on actual playback</li>
              <li>• Auto-saves every 5 seconds while playing</li>
              <li>• Saves immediately when you pause or leave the page</li>
              <li>• <strong> You must reach 95% of the ACTUAL video length to mark complete</strong></li>
              <li>• The "Mark Complete" button unlocks after 95%</li>
              <li>• You can resume from where you left off anytime</li>
            </ul>
          </div>

          {/* 95% Requirement Notice */}
          {!isCompleted && !hasWatched95Percent && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-yellow-900">95% Completion Required</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Watch up to <strong>{formatDuration(durationToUse * 0.95)}</strong> (95% of actual {formatDuration(durationToUse)}) to unlock completion.
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Current position: <strong>{formatDuration(watchTime)}</strong> 
                    &nbsp;• Progress: <strong>{progressPercentage}%</strong>
                    &nbsp;• Need: <strong>{95 - progressPercentage}%</strong> more
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;