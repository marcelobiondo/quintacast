#!/usr/bin/env python3
"""QuintaCast SESX auto-compactor.

Uses the internal gaps of a prepared Adobe Audition guide track as the edit
decision list, applies a safety margin to both sides of every gap, and writes
a NEW .sesx with the same temporal removals applied to all audio tracks.

The source .sesx is never modified.
"""
from __future__ import annotations

import argparse
import bisect
from copy import deepcopy
from pathlib import Path
from xml.etree import ElementTree as ET


def parse_args():
    p = argparse.ArgumentParser(description="Compact an Audition SESX from a split silence guide.")
    p.add_argument("input", type=Path, help="Input .sesx")
    p.add_argument("--margin-ms", type=float, default=100.0,
                   help="Safety margin preserved on EACH side of every guide gap (default: 100)")
    p.add_argument("--guide-track", type=int, default=1,
                   help="1-based audio track number used as guide (default: 1)")
    p.add_argument("-o", "--output", type=Path, help="Output .sesx path")
    return p.parse_args()


def main():
    args = parse_args()
    if args.margin_ms < 0:
        raise SystemExit("--margin-ms must be >= 0")
    if args.input.suffix.lower() != ".sesx":
        raise SystemExit("Input must be a .sesx file")

    tree = ET.parse(args.input)
    root = tree.getroot()
    session = root.find("session")
    if session is None:
        raise SystemExit("Invalid SESX: <session> not found")

    tracks_node = session.find("tracks")
    tracks = [] if tracks_node is None else tracks_node.findall("audioTrack")
    if not tracks:
        raise SystemExit("Invalid SESX: no audio tracks found")
    if not 1 <= args.guide_track <= len(tracks):
        raise SystemExit(f"--guide-track must be between 1 and {len(tracks)}")

    sample_rate = int(session.get("sampleRate") or 48000)
    margin = round(args.margin_ms * sample_rate / 1000)
    guide = tracks[args.guide_track - 1]

    guide_clips = sorted(
        ((int(c.get("startPoint")), int(c.get("endPoint")))
         for c in guide.findall("audioClip")),
        key=lambda x: x[0],
    )
    if len(guide_clips) < 2:
        raise SystemExit("Guide needs at least two clips; run Split Silence first")

    merged = []
    for start, end in guide_clips:
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)

    raw_gaps = [(merged[i][1], merged[i + 1][0])
                for i in range(len(merged) - 1)
                if merged[i + 1][0] > merged[i][1]]

    # Never remove leading/trailing session silence. A gap is compacted only
    # when enough room remains after preserving the safety margin on both sides.
    gaps = []
    for start, end in raw_gaps:
        safe_start, safe_end = start + margin, end - margin
        if safe_end > safe_start:
            gaps.append((safe_start, safe_end))

    if not gaps:
        raise SystemExit("No removable internal gaps remain with this margin")

    gap_ends = [end for _, end in gaps]
    lengths = [end - start for start, end in gaps]
    prefix = [0]
    for length in lengths:
        prefix.append(prefix[-1] + length)

    def removed_before(t):
        return prefix[bisect.bisect_right(gap_ends, t)]

    def map_time(t):
        return t - removed_before(t)

    def subtract_gaps(start, end):
        pieces, cur = [], start
        i = bisect.bisect_right(gap_ends, start)
        while i < len(gaps) and gaps[i][0] < end:
            gs, ge = gaps[i]
            if gs > cur:
                pieces.append((cur, min(gs, end)))
            cur = max(cur, ge)
            if cur >= end:
                break
            i += 1
        if cur < end:
            pieces.append((cur, end))
        return [(a, b) for a, b in pieces if b > a]

    def fragment(original, a, b, new_id, zorder):
        c = deepcopy(original)
        old_start = int(original.get("startPoint"))
        source_in = int(original.get("sourceInPoint"))
        c.set("startPoint", str(map_time(a)))
        c.set("endPoint", str(map_time(b)))
        c.set("sourceInPoint", str(source_in + (a - old_start)))
        c.set("sourceOutPoint", str(source_in + (b - old_start)))
        c.set("id", str(new_id))
        c.set("zOrder", str(zorder))
        c.set("crossFadeHeadClipID", "-1")
        c.set("crossFadeTailClipID", "-1")
        c.set("select", "false")
        duration = b - a
        fade_in, fade_out = c.find("fadeIn"), c.find("fadeOut")
        if fade_in is not None:
            fade_in.set("startPoint", "0")
            fade_in.set("endPoint", "0")
        if fade_out is not None:
            fade_out.set("startPoint", str(duration))
            fade_out.set("endPoint", str(duration))
        return c

    stats = []
    for track_no, track in enumerate(tracks, 1):
        old = list(track.findall("audioClip"))
        generated = []
        for clip in old:
            start, end = int(clip.get("startPoint")), int(clip.get("endPoint"))
            for a, b in subtract_gaps(start, end):
                generated.append(fragment(clip, a, b, len(generated), len(generated) + 1))

        for clip in old:
            track.remove(clip)

        insert_at = 0
        for idx, child in enumerate(list(track)):
            if child.tag == "editParameter":
                insert_at = idx + 1
        for clip in generated:
            track.insert(insert_at, clip)
            insert_at += 1
        stats.append((track_no, len(old), len(generated)))

    total_removed = sum(lengths)
    old_duration = int(session.get("duration") or 0)
    if old_duration:
        session.set("duration", str(max(0, old_duration - total_removed)))

    output = args.output or args.input.with_name(
        f"{args.input.stem} - compactado-auto-{args.margin_ms:g}ms.sesx"
    )
    if output.resolve() == args.input.resolve():
        raise SystemExit("Output must differ from input; source SESX is never overwritten")

    # ElementTree does not preserve the original DOCTYPE, so write the SESX
    # declaration expected by Audition explicitly.
    xml = ET.tostring(root, encoding="utf-8")
    with output.open("wb") as f:
        f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE sesx>\n')
        f.write(xml)

    print(f"Created: {output}")
    print(f"Sample rate: {sample_rate} Hz")
    print(f"Guide track: {args.guide_track}")
    print(f"Safety margin: {args.margin_ms:g} ms/side")
    print(f"Internal guide gaps: {len(raw_gaps)}")
    print(f"Compacted gaps: {len(gaps)}")
    print(f"Preserved short gaps: {len(raw_gaps) - len(gaps)}")
    print(f"Removed: {total_removed / sample_rate:.2f}s ({total_removed / sample_rate / 60:.2f} min)")
    for track_no, before, after in stats:
        print(f"Track {track_no}: {before} -> {after} clips")


if __name__ == "__main__":
    main()
