import React, { Component, createRef } from 'react';
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
  private videoRef = createRef<HTMLVideoElement>();

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
        <div className="video-container">
          <video key={videoUrl} ref={this.videoRef} controls autoPlay loop>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        </div>
        <button className="video-info-btn" onClick={this.toggleMeta} title="Clip metadata">
          {showMeta ? '\u2715' : '\u24D8'}
        </button>
        {showMeta && (
          <div className="video-meta-overlay">
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
}

export default VideoPlayer;
