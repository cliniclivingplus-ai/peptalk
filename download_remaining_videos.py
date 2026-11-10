import concurrent.futures
import json
import pathlib
import re
import shutil
import sys
from datetime import datetime, timezone

sys.path.insert(0, r"C:\Peptide")
import download_course_videos as downloader

ROOT = pathlib.Path(r"C:\Peptide")
WORK = ROOT / "video_work"
STATE_PATH = WORK / "transfer-progress.json"
OUT_PATH = WORK / "download-only-progress.json"
MAX_BATCH_COUNT = 4
MAX_BATCH_BYTES = 550_000_000
MIN_FREE_BYTES = 2_000_000_000


def lesson_key(job):
    return job["lesson_url"].split("&", 1)[0]


def stem_for(job):
    return f'{job["li"] + 1:03d} - {downloader.safe(job["title"])}'


def local_video(job):
    folder = downloader.folder(job)
    stem = stem_for(job)
    for ext in (".mp4", ".mkv", ".webm"):
        candidate = folder / f"{stem}{ext}"
        if candidate.is_file():
            return candidate
    return None


def save_progress(total, attempted, saved, failures, phase, batch):
    data = {
        "updated_utc": datetime.now(timezone.utc).isoformat(),
        "phase": phase,
        "batch": batch,
        "total_lessons": total,
        "already_verified_in_drive": 51,
        "attempted_this_run": attempted,
        "saved_or_present_locally": saved,
        "failures": failures,
        "remaining_disk_bytes": shutil.disk_usage(ROOT).free,
    }
    OUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    prepared = json.loads((WORK / "prepared-videos.json").read_text(encoding="utf-8"))
    archive = json.loads((ROOT / "Skool_Archive" / "archive.json").read_text(encoding="utf-8"))
    known = {lesson_key(r["job"]) for r in prepared}
    for lesson in archive:
        key = lesson["url"].split("&", 1)[0]
        if key in known:
            continue
        links = [a["url"] for a in lesson.get("links", [])
                 if re.match(r"https?://(?:www\.)?(?:youtu\.be/|youtube\.com/watch|vimeo\.com/|loom\.com/share/)", a["url"])]
        if links:
            job = {"ci": lesson["ci"], "li": lesson["li"], "course": lesson["course"],
                   "title": lesson["title"], "lesson_url": lesson["url"],
                   "video_id": None, "other_video_fields": {"videoLink": links[0]}, "has_access": 1}
            prepared.append(downloader.prepare(job))
            known.add(key)

    transfer = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    drive_done = {lesson_key(r["job"]) for r in transfer.get("verified", [])}
    failures = []
    saved = []
    queue = []
    for row in prepared:
        job = row["job"]
        if lesson_key(job) in drive_done:
            continue
        path = local_video(job)
        if path:
            try:
                stats = downloader.probe(path)
                saved.append({"lesson": job["title"], "file": str(path), "bytes": stats["bytes"], "status": "already_saved"})
                continue
            except Exception:
                failures.append({"lesson": job["title"], "status": "existing_local_file_failed_probe"})
                continue
        if not row.get("ready"):
            row = downloader.prepare(job)
        if row.get("ready"):
            queue.append(row)
        else:
            failures.append({"lesson": job["title"], "status": "source_unavailable"})

    total = len(prepared)
    attempted = 0
    batch_num = 0
    save_progress(total, attempted, saved, failures, "downloading", batch_num)
    print(json.dumps({"phase": "downloading", "total": total, "pending": len(queue),
                      "already_saved_or_drive_verified": len(saved) + len(drive_done)}, ensure_ascii=False), flush=True)

    while queue:
        batch = []
        budget = 0
        while queue and len(batch) < MAX_BATCH_COUNT:
            row = queue[0]
            estimate = int(row.get("estimated_bytes") or 0)
            if not estimate:
                failures.append({"lesson": row["job"]["title"], "status": "missing_size_estimate"})
                queue.pop(0)
                continue
            if batch and budget + estimate > MAX_BATCH_BYTES:
                break
            if estimate > MAX_BATCH_BYTES:
                failures.append({"lesson": row["job"]["title"], "status": "exceeds_batch_limit"})
                queue.pop(0)
                continue
            batch.append(queue.pop(0))
            budget += estimate
        if not batch:
            break
        free = shutil.disk_usage(ROOT).free
        if free < max(budget * 2 + MIN_FREE_BYTES, MIN_FREE_BYTES):
            save_progress(total, attempted, saved, failures, "disk_space_pause", batch_num)
            print(json.dumps({"phase": "disk_space_pause", "pending": len(batch) + len(queue),
                              "free_bytes": free, "estimated_batch_bytes": budget}), flush=True)
            return 3
        batch_num += 1
        print(json.dumps({"phase": "downloading_batch", "batch": batch_num, "videos": len(batch),
                          "estimate_bytes": budget, "free_bytes": free}), flush=True)
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(downloader.download, batch))
        attempted += len(batch)
        for result in results:
            job = result.get("job", {})
            if result.get("status") == "verified":
                saved.append({"lesson": job.get("title"), "course": job.get("course"),
                              "file": result.get("file"), "bytes": result.get("bytes"),
                              "duration": result.get("duration"), "status": "saved_locally"})
            else:
                failures.append({"lesson": job.get("title"), "course": job.get("course"),
                                 "status": result.get("status", "failed"),
                                 "error": result.get("error", "download did not complete")})
        save_progress(total, attempted, saved, failures, "downloading" if queue else "finished", batch_num)
        print(json.dumps({"phase": "batch_complete", "batch": batch_num, "attempted": attempted,
                          "saved_or_present_locally": len(saved), "failures": len(failures),
                          "pending": len(queue), "free_gb": round(shutil.disk_usage(ROOT).free / 1e9, 2)}, ensure_ascii=False), flush=True)

    phase = "finished_with_failures" if failures else "finished"
    save_progress(total, attempted, saved, failures, phase, batch_num)
    print(json.dumps({"phase": phase, "total": total, "attempted": attempted,
                      "saved_or_present_locally": len(saved), "failures": len(failures),
                      "free_gb": round(shutil.disk_usage(ROOT).free / 1e9, 2)}, ensure_ascii=False), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
