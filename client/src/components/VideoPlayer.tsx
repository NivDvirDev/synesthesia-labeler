import React, { Component } from 'react';
import { ClipDetail } from '../types';
import { getVideoUrl } from '../api';

interface VideoPlayerProps {
  clipId: string;
  filename: string;
  metadata: ClipDetail;
  useHuggingFace?: boolean;
}

interface VideoPlayerState {
  showMeta: boolean;
  videoUrl: string;
}

class VideoPlayer extends Component<VideoPlayerProps, VideoPlayerState> {
  state: VideoPlayerState = {
    showMeta: false,
    videoUrl: `/videos/${encodeURIComponent(this.props.filename)}`,
  };

  componentDidMount() {
    this.resolveVideoUrl();
  }

  componentDidUpdate(prevProps: VideoPlayerProps) {
    if (prevProps.clipId !== this.props.clipId) {
      this.setState({ showMeta: false });
      this.resolveVideoUrl();
    }
  }

  resolveVideoUrl = () => {
    if (this.props.useHuggingFace) {
      getVideoUrl(this.props.filename).then((url) => {
        this.setState({ videoUrl: url });
      });
    } else {
      this.setState({ videoUrl: `/videos/${encodeURIComponent(this.props.filename)}` });
    }
  };

  toggleMeta = () => {
    this.setState((s) => ({ showMeta: !s.showMeta }));
  };

  render() {
    const { metadata } = this.props;
    const { showMeta, videoUrl } = this.state;

    return (
      <div className="video-player">
        <video key={videoUrl} controls autoPlay>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video element.
        </video>
        <div className="video-meta">
          <button className="video-meta-toggle" onClick={this.toggleMeta}>
            {showMeta ? 'Hide' : 'Show'} metadata
          </button>
          {showMeta && (
            <div className="video-meta-content">
              {JSON.stringify(metadata, null, 2)}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default VideoPlayer;
