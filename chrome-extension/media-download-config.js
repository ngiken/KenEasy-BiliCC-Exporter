(function registerMediaDownloadConfig(root) {
  const QUALITY_LADDER = Object.freeze([
    Object.freeze({ qn: 127, labelKey: 'quality8k', fallbackLabel: '8K', rank: 100 }),
    Object.freeze({ qn: 126, labelKey: 'qualityDolbyVision', fallbackLabel: 'Dolby Vision', rank: 95 }),
    Object.freeze({ qn: 125, labelKey: 'qualityHdr', fallbackLabel: 'HDR', rank: 90 }),
    Object.freeze({ qn: 120, labelKey: 'quality4k', fallbackLabel: '4K', rank: 85 }),
    Object.freeze({ qn: 116, labelKey: 'quality1080p60', fallbackLabel: '1080P60', rank: 80 }),
    Object.freeze({ qn: 112, labelKey: 'quality1080pPlus', fallbackLabel: '1080P+', rank: 75 }),
    Object.freeze({ qn: 80, labelKey: 'quality1080p', fallbackLabel: '1080P', rank: 70 }),
    Object.freeze({ qn: 74, labelKey: 'quality720p60', fallbackLabel: '720P60', rank: 65 }),
    Object.freeze({ qn: 64, labelKey: 'quality720p', fallbackLabel: '720P', rank: 60 }),
    Object.freeze({ qn: 32, labelKey: 'quality480p', fallbackLabel: '480P', rank: 40 }),
    Object.freeze({ qn: 16, labelKey: 'quality360p', fallbackLabel: '360P', rank: 20 }),
  ]);

  const DOWNLOAD_MODES = Object.freeze([
    Object.freeze({
      id: 'video_with_audio',
      labelKey: 'downloadVideoWithAudio',
      fallbackLabel: 'Video + audio',
      needsVideo: true,
      needsAudio: true,
      extension: 'mp4',
    }),
    Object.freeze({
      id: 'audio_only',
      labelKey: 'downloadAudioOnly',
      fallbackLabel: 'Audio only',
      needsVideo: false,
      needsAudio: true,
      extension: 'm4a',
    }),
    Object.freeze({
      id: 'video_only',
      labelKey: 'downloadVideoOnly',
      fallbackLabel: 'Video only',
      needsVideo: true,
      needsAudio: false,
      extension: 'mp4',
    }),
  ]);

  /**
   * Ordered stream resolution strategies.
   * First matching strategy that can satisfy the mode wins.
   */
  const STREAM_STRATEGIES = Object.freeze([
    Object.freeze({
      id: 'dash_avc_aac',
      kind: 'dash',
      fnval: 16 | 64 | 128 | 256 | 512 | 1024 | 2048,
      preferVideoCodecIncludes: Object.freeze(['avc1']),
      preferAudioCodecIncludes: Object.freeze(['mp4a']),
      fourk: 1,
    }),
    Object.freeze({
      id: 'dash_any',
      kind: 'dash',
      fnval: 16 | 64 | 128 | 256 | 512 | 1024 | 2048,
      preferVideoCodecIncludes: Object.freeze([]),
      preferAudioCodecIncludes: Object.freeze([]),
      fourk: 1,
    }),
    Object.freeze({
      id: 'durl_mp4',
      kind: 'durl',
      fnval: 1,
      fourk: 0,
    }),
  ]);

  const MESSAGE_TYPES = Object.freeze({
    resolveMediaOptions: 'RESOLVE_MEDIA_OPTIONS',
    startMediaDownload: 'START_MEDIA_DOWNLOAD',
    mediaDownloadProgress: 'MEDIA_DOWNLOAD_PROGRESS',
  });

  const config = Object.freeze({
    qualityLadder: QUALITY_LADDER,
    downloadModes: DOWNLOAD_MODES,
    streamStrategies: STREAM_STRATEGIES,
    messages: MESSAGE_TYPES,
    playurlPath: '/x/player/wbi/playurl',
    playurlFallbackPath: '/x/player/playurl',
    defaultModeId: 'video_with_audio',
    defaultQualityId: 'auto',
    autoQualityId: 'auto',
    maxParallelFetches: 2,
    progress: Object.freeze({
      resolve: 8,
      select: 14,
      videoStart: 18,
      audioStart: 52,
      remuxStart: 86,
      saveStart: 94,
      done: 100,
    }),
  });

  Object.defineProperty(root, 'KENEASY_MEDIA_DOWNLOAD_CONFIG', {
    value: config,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}(globalThis));
