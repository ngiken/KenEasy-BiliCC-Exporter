/**
 * Stream resolution layer.
 * Turns Bilibili playurl payloads into mode/quality options using data-driven rules.
 */
(function registerMediaStreamResolver(root) {
  const CONFIG = root.KENEASY_MEDIA_DOWNLOAD_CONFIG;
  const BRAND_CONFIG = root.KENEASY_BILICC_CONFIG;

  function qualityMeta(qn) {
    return CONFIG.qualityLadder.find((item) => item.qn === Number(qn)) || {
      qn: Number(qn) || 0,
      labelKey: '',
      fallbackLabel: `QN${qn}`,
      rank: Number(qn) || 0,
    };
  }

  function codecText(stream) {
    return String(stream?.codecs || stream?.codecs || '');
  }

  function streamUrl(stream) {
    return stream?.baseUrl || stream?.base_url || stream?.backupUrl?.[0] || stream?.backup_url?.[0] || '';
  }

  function streamBackupUrls(stream) {
    const backups = [];
    const push = (value) => {
      if (!value || backups.includes(value)) return;
      backups.push(value);
    };
    const primary = streamUrl(stream);
    const lists = [stream?.backupUrl, stream?.backup_url].filter(Boolean);
    lists.forEach((list) => {
      if (Array.isArray(list)) list.forEach(push);
      else push(list);
    });
    return backups.filter((url) => url !== primary);
  }

  function pickBestStream(streams, preferredCodecIncludes = []) {
    if (!Array.isArray(streams) || streams.length === 0) return null;

    const ranked = streams
      .map((stream, index) => {
        const codecs = codecText(stream).toLowerCase();
        const preferHit = preferredCodecIncludes.some((token) => codecs.includes(String(token).toLowerCase()));
        return {
          stream,
          index,
          preferHit,
          bandwidth: Number(stream.bandwidth || stream.band_width || 0),
          id: Number(stream.id || 0),
        };
      })
      .sort((left, right) => {
        if (left.preferHit !== right.preferHit) return left.preferHit ? -1 : 1;
        if (right.id !== left.id) return right.id - left.id;
        if (right.bandwidth !== left.bandwidth) return right.bandwidth - left.bandwidth;
        return left.index - right.index;
      });

    return ranked[0]?.stream || null;
  }

  function uniqueBy(items, keyFn) {
    const seen = new Set();
    return items.filter((item) => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function listDashQualities(dash) {
    const videos = dash?.video || [];
    return uniqueBy(
      videos.map((stream) => {
        const meta = qualityMeta(stream.id);
        return {
          id: String(meta.qn),
          qn: meta.qn,
          labelKey: meta.labelKey,
          label: meta.fallbackLabel,
          rank: meta.rank,
          codecs: codecText(stream),
          bandwidth: Number(stream.bandwidth || 0),
          kind: 'dash',
        };
      }),
      (item) => item.id,
    ).sort((left, right) => right.rank - left.rank || right.qn - left.qn);
  }

  function listDurlQualities(acceptQuality = [], quality) {
    const values = (acceptQuality || []).map(Number).filter(Boolean);
    if (quality) values.push(Number(quality));
    return uniqueBy(
      values.map((qn) => {
        const meta = qualityMeta(qn);
        return {
          id: String(meta.qn),
          qn: meta.qn,
          labelKey: meta.labelKey,
          label: meta.fallbackLabel,
          rank: meta.rank,
          codecs: 'durl',
          bandwidth: 0,
          kind: 'durl',
        };
      }),
      (item) => item.id,
    ).sort((left, right) => right.rank - left.rank || right.qn - left.qn);
  }

  function selectDashPlan(dash, mode, targetQn) {
    const videos = dash?.video || [];
    const audios = dash?.audio || dash?.dolby?.audio || [];
    let videoPool = videos;
    if (targetQn && targetQn !== CONFIG.autoQualityId) {
      const exact = videos.filter((stream) => Number(stream.id) === Number(targetQn));
      if (exact.length > 0) videoPool = exact;
    }

    const video = mode.needsVideo
      ? pickBestStream(videoPool, mode.id === 'video_with_audio' ? ['avc1'] : [])
      : null;
    const audio = mode.needsAudio
      ? pickBestStream(audios, ['mp4a'])
      : null;

    if (mode.needsVideo && !video) return null;
    if (mode.needsAudio && !audio) return null;

    return {
      kind: 'dash',
      qualityQn: Number(video?.id || audio?.id || targetQn || 0),
      qualityLabel: qualityMeta(video?.id || targetQn).fallbackLabel,
      videoUrl: video ? streamUrl(video) : '',
      audioUrl: audio ? streamUrl(audio) : '',
      videoBackupUrls: video ? streamBackupUrls(video) : [],
      audioBackupUrls: audio ? streamBackupUrls(audio) : [],
      videoCodecs: video ? codecText(video) : '',
      audioCodecs: audio ? codecText(audio) : '',
      estimatedBytes:
        Number(video?.bandwidth || 0) + Number(audio?.bandwidth || 0),
    };
  }

  function selectDurlPlan(payload, mode, targetQn) {
    if (!mode.needsVideo || mode.id === 'audio_only') return null;
    const durl = payload?.durl;
    if (!Array.isArray(durl) || durl.length === 0) return null;

    const url = durl[0]?.url || durl[0]?.backup_url?.[0] || '';
    if (!url) return null;

    const qn = Number(payload.quality || targetQn || 0);
    const backups = [];
    const push = (value) => {
      if (!value || value === url || backups.includes(value)) return;
      backups.push(value);
    };
    (durl[0]?.backup_url || []).forEach(push);
    (durl.slice(1) || []).forEach((item) => push(item?.url));

    return {
      kind: 'durl',
      qualityQn: qn,
      qualityLabel: qualityMeta(qn).fallbackLabel,
      videoUrl: url,
      audioUrl: '',
      videoBackupUrls: backups,
      audioBackupUrls: [],
      videoCodecs: payload.format || 'mp4',
      audioCodecs: 'mixed',
      estimatedBytes: Number(durl[0]?.size || 0),
    };
  }

  function buildOptionsFromPayload(payload) {
    const dashQualities = payload?.dash ? listDashQualities(payload.dash) : [];
    const durlQualities = listDurlQualities(payload?.accept_quality, payload?.quality);
    const qualities = uniqueBy([...dashQualities, ...durlQualities], (item) => item.id)
      .sort((left, right) => right.rank - left.rank || right.qn - left.qn);

    return {
      qualities: [
        {
          id: CONFIG.autoQualityId,
          qn: 0,
          labelKey: 'qualityAuto',
          label: 'Auto',
          rank: Number.MAX_SAFE_INTEGER,
          kind: 'auto',
        },
        ...qualities,
      ],
      modes: CONFIG.downloadModes.map((mode) => ({
        id: mode.id,
        labelKey: mode.labelKey,
        label: mode.fallbackLabel,
        extension: mode.extension,
      })),
      hasDash: Boolean(payload?.dash),
      hasDurl: Array.isArray(payload?.durl) && payload.durl.length > 0,
      currentQuality: Number(payload?.quality || 0) || null,
    };
  }

  function resolvePlan(payload, modeId, qualityId) {
    const mode = CONFIG.downloadModes.find((item) => item.id === modeId) || CONFIG.downloadModes[0];
    const targetQn = !qualityId || qualityId === CONFIG.autoQualityId ? CONFIG.autoQualityId : qualityId;

    // Prefer DASH for flexible A/V selection; fall back to single-file durl.
    if (payload?.dash) {
      const dashPlan = selectDashPlan(payload.dash, mode, targetQn);
      if (dashPlan) {
        return { mode, plan: dashPlan };
      }
    }

    const durlPlan = selectDurlPlan(payload, mode, targetQn === CONFIG.autoQualityId ? payload?.quality : targetQn);
    if (durlPlan) {
      return { mode, plan: durlPlan };
    }

    throw new Error('No downloadable media stream matched the selected rules.');
  }

  root.KenEasyMediaStreamResolver = Object.freeze({
    buildOptionsFromPayload,
    resolvePlan,
    qualityMeta,
    streamUrl,
    logPrefix: BRAND_CONFIG?.logPrefix || '[KenEasy BiliCC]',
  });
}(globalThis));
