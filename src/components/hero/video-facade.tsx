"use client";

import { useState } from "react";

import styles from "./hero.module.css";

/**
 * Click-to-play YouTube facade (SPEC §4 Hero).
 *
 * Before the click the DOM contains ONLY a static thumbnail image and a
 * play button — no YouTube iframe and no YouTube JS. On click the facade
 * swaps in the privacy-enhanced youtube-nocookie embed with autoplay, so
 * the video starts immediately and third-party code loads only after an
 * explicit user gesture.
 */

const VIDEO_ID = "y2jKMmFu-E8";

const THUMBNAIL_SRC = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`;

const EMBED_SRC = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

export default function VideoFacade() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.media}>
      {playing ? (
        <div className={styles.frame}>
          <iframe
            className={styles.player}
            src={EMBED_SRC}
            title="Nuro demo video"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          className={`${styles.frame} ${styles.facade} focusable`}
          aria-label="Play Nuro demo video"
          onClick={() => setPlaying(true)}
        >
          {/* Remote YouTube thumbnail: next/image needs a configured remote
              loader and offers no benefit for a single static facade frame,
              so a plain <img> is deliberate here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.thumb}
            src={THUMBNAIL_SRC}
            alt="Nuro demo video thumbnail"
          />
          <span className={styles.play} aria-hidden="true">
            <svg width="20" height="22" viewBox="0 0 20 22" fill="#16161c">
              <path d="M0 0l20 11L0 22z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
