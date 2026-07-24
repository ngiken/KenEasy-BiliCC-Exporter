/**
 * ISO BMFF / fMP4 helpers and remux layer.
 * Keeps box parsing, track rewriting, and assembly decoupled from download orchestration.
 */
(function registerMediaFmp4Remux(root) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  function readU32(view, offset) {
    return view.getUint32(offset);
  }

  function readU64(view, offset) {
    const high = view.getUint32(offset);
    const low = view.getUint32(offset + 4);
    return high * 2 ** 32 + low;
  }

  function writeU32(value) {
    const bytes = new Uint8Array(4);
    new DataView(bytes.buffer).setUint32(0, value >>> 0);
    return bytes;
  }

  function concatBytes(chunks) {
    const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const output = new Uint8Array(total);
    let offset = 0;
    chunks.forEach((chunk) => {
      output.set(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    });
    return output;
  }

  function boxType(bytes, offset) {
    return decoder.decode(bytes.subarray(offset + 4, offset + 8));
  }

  function parseBoxes(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const boxes = [];
    let offset = 0;

    while (offset + 8 <= bytes.byteLength) {
      let size = readU32(view, offset);
      let headerSize = 8;
      const type = boxType(bytes, offset);

      if (size === 1) {
        if (offset + 16 > bytes.byteLength) break;
        size = readU64(view, offset + 8);
        headerSize = 16;
      } else if (size === 0) {
        size = bytes.byteLength - offset;
      }

      if (size < headerSize || offset + size > bytes.byteLength) break;

      boxes.push({
        type,
        offset,
        size,
        headerSize,
        data: bytes.subarray(offset, offset + size),
        content: bytes.subarray(offset + headerSize, offset + size),
      });
      offset += size;
    }

    return boxes;
  }

  function findBox(boxes, type) {
    return boxes.find((box) => box.type === type) || null;
  }

  function findBoxes(boxes, type) {
    return boxes.filter((box) => box.type === type);
  }

  function parseChildBoxes(parentBox) {
    return parseBoxes(parentBox.content);
  }

  function rebuildBox(type, contentBytes) {
    const typeBytes = encoder.encode(type);
    if (typeBytes.byteLength !== 4) {
      throw new Error(`Invalid box type: ${type}`);
    }
    const size = 8 + contentBytes.byteLength;
    return concatBytes([writeU32(size), typeBytes, contentBytes]);
  }

  function replaceChildren(parentBox, childBoxesData) {
    return rebuildBox(parentBox.type, concatBytes(childBoxesData));
  }

  function getTrackIdFromTkhd(tkhdBox) {
    const view = new DataView(
      tkhdBox.content.buffer,
      tkhdBox.content.byteOffset,
      tkhdBox.content.byteLength,
    );
    const version = tkhdBox.content[0];
    // version 0: track_ID at byte 12; version 1: track_ID at byte 20
    const trackIdOffset = version === 1 ? 20 : 12;
    return view.getUint32(trackIdOffset);
  }

  function setTrackIdInTkhd(tkhdBox, trackId) {
    const content = tkhdBox.content.slice();
    const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
    const version = content[0];
    const trackIdOffset = version === 1 ? 20 : 12;
    view.setUint32(trackIdOffset, trackId >>> 0);
    return rebuildBox('tkhd', content);
  }

  function setTrackIdInTrex(trexBox, trackId) {
    const content = trexBox.content.slice();
    const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
    // version/flags (4) + track_ID (4)
    view.setUint32(4, trackId >>> 0);
    return rebuildBox('trex', content);
  }

  function setTrackIdInTfhd(tfhdBox, trackId) {
    const content = tfhdBox.content.slice();
    const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
    // version/flags (4) + track_ID (4)
    view.setUint32(4, trackId >>> 0);
    return rebuildBox('tfhd', content);
  }

  function rewriteTrakTrackId(trakBox, trackId) {
    const children = parseChildBoxes(trakBox).map((child) => {
      if (child.type === 'tkhd') return setTrackIdInTkhd(child, trackId);
      return child.data;
    });
    return replaceChildren(trakBox, children);
  }

  function rewriteMoofTrackId(moofBox, trackId) {
    const children = parseChildBoxes(moofBox).map((child) => {
      if (child.type !== 'traf') return child.data;
      const trafChildren = parseChildBoxes(child).map((trafChild) => {
        if (trafChild.type === 'tfhd') return setTrackIdInTfhd(trafChild, trackId);
        return trafChild.data;
      });
      return replaceChildren(child, trafChildren);
    });
    return replaceChildren(moofBox, children);
  }

  function extractMoovParts(moovBox) {
    const children = parseChildBoxes(moovBox);
    const traks = findBoxes(children, 'trak');
    const mvex = findBox(children, 'mvex');
    const others = children.filter((child) => child.type !== 'trak' && child.type !== 'mvex');
    const trexs = mvex ? findBoxes(parseChildBoxes(mvex), 'trex') : [];
    const mvexOthers = mvex
      ? parseChildBoxes(mvex).filter((child) => child.type !== 'trex')
      : [];

    return {
      traks,
      trexs,
      others,
      mvexOthers,
      hasMvex: Boolean(mvex),
    };
  }

  function buildMergedMoov(videoMoov, audioMoov, videoTrackId, audioTrackId) {
    const videoParts = extractMoovParts(videoMoov);
    const audioParts = extractMoovParts(audioMoov);

    if (videoParts.traks.length === 0) {
      throw new Error('Video moov has no trak box.');
    }
    if (audioParts.traks.length === 0) {
      throw new Error('Audio moov has no trak box.');
    }

    const videoTrak = rewriteTrakTrackId(videoParts.traks[0], videoTrackId);
    const audioTrak = rewriteTrakTrackId(audioParts.traks[0], audioTrackId);

    const videoTrex = videoParts.trexs[0]
      ? setTrackIdInTrex(videoParts.trexs[0], videoTrackId)
      : null;
    const audioTrex = audioParts.trexs[0]
      ? setTrackIdInTrex(audioParts.trexs[0], audioTrackId)
      : null;

    const mergedChildren = [
      ...videoParts.others.map((box) => box.data),
      videoTrak,
      audioTrak,
    ];

    if (videoParts.hasMvex || audioParts.hasMvex) {
      const mvexChildren = [
        ...videoParts.mvexOthers.map((box) => box.data),
      ];
      if (videoTrex) mvexChildren.push(videoTrex);
      if (audioTrex) mvexChildren.push(audioTrex);
      mergedChildren.push(rebuildBox('mvex', concatBytes(mvexChildren)));
    }

    return rebuildBox('moov', concatBytes(mergedChildren));
  }

  function collectSegmentPairs(boxes, trackId) {
    const pairs = [];
    for (let index = 0; index < boxes.length; index += 1) {
      const box = boxes[index];
      if (box.type !== 'moof') continue;
      const next = boxes[index + 1];
      if (!next || next.type !== 'mdat') {
        throw new Error('Found moof without following mdat.');
      }
      pairs.push({
        moof: rewriteMoofTrackId(box, trackId),
        mdat: next.data,
      });
    }
    return pairs;
  }

  function buildFtyp() {
    // major_brand = isom, minor_version = 0x200, compatible brands
    const major = encoder.encode('isom');
    const minor = writeU32(0x200);
    const brands = ['isom', 'iso2', 'iso5', 'mp41', 'avc1', 'dash'].map((brand) => encoder.encode(brand));
    return rebuildBox('ftyp', concatBytes([major, minor, ...brands]));
  }

  /**
   * Merge complete bilibili DASH video/audio fMP4 buffers into one playable MP4.
   */
  function mergeDashVideoAudio(videoBuffer, audioBuffer) {
    const videoBoxes = parseBoxes(videoBuffer);
    const audioBoxes = parseBoxes(audioBuffer);

    const videoMoov = findBox(videoBoxes, 'moov');
    const audioMoov = findBox(audioBoxes, 'moov');
    if (!videoMoov || !audioMoov) {
      throw new Error('DASH stream is missing moov.');
    }

    const videoTrackId = 1;
    const audioTrackId = 2;
    const mergedMoov = buildMergedMoov(videoMoov, audioMoov, videoTrackId, audioTrackId);
    const videoSegments = collectSegmentPairs(videoBoxes, videoTrackId);
    const audioSegments = collectSegmentPairs(audioBoxes, audioTrackId);

    if (videoSegments.length === 0) {
      throw new Error('Video stream has no media segments.');
    }
    if (audioSegments.length === 0) {
      throw new Error('Audio stream has no media segments.');
    }

    // Keep source segment order per track. Most local players accept sequential A/V fMP4 tracks.
    const mediaChunks = [];
    videoSegments.forEach((segment) => {
      mediaChunks.push(segment.moof, segment.mdat);
    });
    audioSegments.forEach((segment) => {
      mediaChunks.push(segment.moof, segment.mdat);
    });

    return concatBytes([buildFtyp(), mergedMoov, ...mediaChunks]).buffer;
  }

  /**
   * Normalize a single-track fMP4 (audio or video) into a cleaner standalone file.
   */
  function normalizeSingleTrack(buffer, preferredTrackId = 1) {
    const boxes = parseBoxes(buffer);
    const moov = findBox(boxes, 'moov');
    if (!moov) return buffer instanceof ArrayBuffer ? buffer : buffer.buffer;

    const parts = extractMoovParts(moov);
    if (parts.traks.length === 0) {
      return buffer instanceof ArrayBuffer ? buffer : buffer.buffer;
    }

    const trak = rewriteTrakTrackId(parts.traks[0], preferredTrackId);
    const trex = parts.trexs[0] ? setTrackIdInTrex(parts.trexs[0], preferredTrackId) : null;
    const moovChildren = [...parts.others.map((box) => box.data), trak];
    if (parts.hasMvex) {
      const mvexChildren = [...parts.mvexOthers.map((box) => box.data)];
      if (trex) mvexChildren.push(trex);
      moovChildren.push(rebuildBox('mvex', concatBytes(mvexChildren)));
    }

    const rebuiltMoov = rebuildBox('moov', concatBytes(moovChildren));
    const segments = collectSegmentPairs(boxes, preferredTrackId);
    if (segments.length === 0) {
      // Progressive MP4 fallback: keep original bytes.
      return buffer instanceof ArrayBuffer ? buffer : buffer.buffer.slice(
        buffer.byteOffset || 0,
        (buffer.byteOffset || 0) + buffer.byteLength,
      );
    }

    const mediaChunks = [];
    segments.forEach((segment) => {
      mediaChunks.push(segment.moof, segment.mdat);
    });
    return concatBytes([buildFtyp(), rebuiltMoov, ...mediaChunks]).buffer;
  }

  root.KenEasyMediaFmp4 = Object.freeze({
    parseBoxes,
    mergeDashVideoAudio,
    normalizeSingleTrack,
  });
}(globalThis));
