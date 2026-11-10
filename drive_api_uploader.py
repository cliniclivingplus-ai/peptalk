"""Small, resumable Google Drive uploader for the saved Skool video queue."""
import base64
import configparser
import hashlib
import json
import pathlib
import time
from datetime import datetime, timezone
from urllib.parse import quote

import requests
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

ROOT = pathlib.Path(r"C:\Peptide")
WORK = ROOT / "video_work"
LOCAL = ROOT / "Classroom - Course Folders"
CONF = WORK / "rclone.conf"
CLIENT_ID = "202264815644.apps.googleusercontent.com"
ENC_SECRET = "eX8GpZTVx3vxMWVkuuBdDWmAUE6rGhTwVrvG9GhllYccSdj2-mvHVg"
KEY = bytes.fromhex("9c935b48730a554d6bfd7c63c886a92bd390198eb8128afbf4de162b8b95f638")
API = "https://www.googleapis.com/drive/v3"
UPLOAD = "https://www.googleapis.com/upload/drive/v3/files"
CHUNK = 128 * 1024 * 1024


def reveal(value):
    raw = base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))
    dec = Cipher(algorithms.AES(KEY), modes.CTR(raw[:16])).decryptor()
    return dec.update(raw[16:]) + dec.finalize()


def digest(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


class DriveUploader:
    def __init__(self):
        cfg = configparser.ConfigParser()
        cfg.read(CONF)
        section = cfg["raaghav_course"]
        token = json.loads(section["token"])
        self.root_id = section["root_folder_id"]
        secret = reveal(ENC_SECRET).decode("utf-8")
        self.refresh_token = token["refresh_token"]
        self.client_secret = secret
        self.client_id = CLIENT_ID
        self._refresh_access_token()
        self.session = requests.Session()
        self.folder_cache = {}
        self.file_cache = {}

    def _refresh_access_token(self):
        resp = requests.post(
            "https://oauth2.googleapis.com/token",
            data={"client_id": self.client_id, "client_secret": self.client_secret,
                  "refresh_token": self.refresh_token, "grant_type": "refresh_token"},
            timeout=30,
        )
        if not resp.ok:
            raise RuntimeError(f"Google OAuth refresh failed ({resp.status_code})")
        self.access_token = resp.json()["access_token"]

    @staticmethod
    def _reason(resp):
        try:
            error = resp.json().get("error", {})
            reason = error.get("status", "")
            details = error.get("errors", [])
            if details:
                reason = details[0].get("reason", reason)
            return reason
        except Exception:
            return "unknown"

    def request(self, method, url, **kwargs):
        for attempt in range(5):
            headers = kwargs.pop("headers", {})
            headers["Authorization"] = "Bearer " + self.access_token
            kwargs["headers"] = headers
            resp = self.session.request(method, url, timeout=(30, 120), **kwargs)
            if resp.status_code == 401 and attempt == 0:
                self._refresh_access_token()
                continue
            reason = ""
            if resp.status_code == 403:
                reason = self._reason(resp)
                if reason not in ("rateLimitExceeded", "userRateLimitExceeded", "dailyLimitExceeded",
                                  "RATE_LIMIT_EXCEEDED", "RESOURCE_EXHAUSTED", "quotaExceeded"):
                    raise RuntimeError(f"Google Drive API returned 403 ({reason or 'unclassified'})")
            if resp.status_code in (403, 429, 500, 502, 503, 504):
                if attempt == 4:
                    raise RuntimeError(f"Google Drive API quota/backoff exhausted ({resp.status_code} {reason})")
                time.sleep(min(30 * (2 ** attempt), 240))
                continue
            return resp
        raise RuntimeError("Google Drive API remains rate limited after bounded backoff")

    def children(self, folder_id):
        if folder_id in self.file_cache:
            return self.file_cache[folder_id]
        found, page = [], None
        while True:
            params = {
                "q": f"'{folder_id}' in parents and trashed = false",
                "pageSize": 1000,
                "fields": "nextPageToken,files(id,name,mimeType,size,md5Checksum,parents,webViewLink)",
            }
            if page:
                params["pageToken"] = page
            resp = self.request("GET", API + "/files", params=params)
            if not resp.ok:
                raise RuntimeError(f"Drive listing failed ({resp.status_code})")
            data = resp.json()
            found.extend(data.get("files", []))
            page = data.get("nextPageToken")
            if not page:
                break
            time.sleep(0.5)
        self.file_cache[folder_id] = found
        return found

    def course_folder(self, name):
        if name not in self.folder_cache:
            matches = [f for f in self.children(self.root_id)
                       if f.get("name") == name and f.get("mimeType") == "application/vnd.google-apps.folder"]
            if len(matches) != 1:
                raise RuntimeError(f"Expected one matching existing Drive course folder: {name}")
            self.folder_cache[name] = matches[0]["id"]
        return self.folder_cache[name]

    def create_or_update_resumable(self, path, name, parent_id, existing=None):
        size = path.stat().st_size
        mime = {".mp4": "video/mp4", ".mkv": "video/x-matroska", ".webm": "video/webm"}[path.suffix.lower()]
        body = {"name": name, "mimeType": mime}
        if not existing:
            body["parents"] = [parent_id]
        endpoint = UPLOAD + ("/" + quote(existing["id"], safe="") if existing else "")
        params = {"uploadType": "resumable", "fields": "id,name,size,md5Checksum,parents,webViewLink"}
        headers = {"Content-Type": "application/json; charset=UTF-8",
                    "X-Upload-Content-Type": mime, "X-Upload-Content-Length": str(size)}
        method = "PATCH" if existing else "POST"
        resp = self.request(method, endpoint, params=params, headers=headers, json=body)
        if not resp.ok or not resp.headers.get("Location"):
            raise RuntimeError(f"Drive upload session creation failed ({resp.status_code})")
        session_url = resp.headers["Location"]
        completed = None
        with path.open("rb") as f:
            start = 0
            while start < size:
                block = f.read(min(CHUNK, size - start))
                end = start + len(block) - 1
                sent = None
                for attempt in range(5):
                    sent = self.session.put(
                        session_url,
                        headers={"Authorization": "Bearer " + self.access_token,
                                 "Content-Type": "application/octet-stream",
                                 "Content-Length": str(len(block)),
                                 "Content-Range": f"bytes {start}-{end}/{size}"},
                        data=block,
                        timeout=(30, 180),
                    )
                    if sent.status_code == 401 and attempt == 0:
                        self._refresh_access_token()
                        continue
                    reason = self._reason(sent) if sent.status_code == 403 else ""
                    quota_error = sent.status_code in (429, 500, 502, 503, 504) or reason in (
                        "rateLimitExceeded", "userRateLimitExceeded", "dailyLimitExceeded",
                        "RATE_LIMIT_EXCEEDED", "RESOURCE_EXHAUSTED", "quotaExceeded")
                    if not quota_error:
                        break
                    if attempt == 4:
                        break
                    delay = min(30 * (2 ** attempt), 240)
                    with (WORK / "uploader-live.log").open("a", encoding="utf-8") as log:
                        log.write(f"{datetime.now(timezone.utc).isoformat()} Drive chunk backoff {sent.status_code} {reason} wait={delay}s {name}\n")
                    time.sleep(delay)
                if sent is None:
                    raise RuntimeError("Drive upload chunk received no response")
                if sent.status_code in (200, 201):
                    completed = sent.json()
                    start = size
                elif sent.status_code == 308:
                    start += len(block)
                    with (WORK / "uploader-live.log").open("a", encoding="utf-8") as log:
                        log.write(f"{datetime.now(timezone.utc).isoformat()} API upload {start}/{size} bytes {name}\n")
                elif sent.status_code in (429, 500, 502, 503, 504):
                    raise RuntimeError(f"Drive resumable chunk paused for API backoff ({sent.status_code})")
                else:
                    raise RuntimeError(f"Drive resumable upload failed ({sent.status_code})")
        if not completed or not completed.get("id"):
            raise RuntimeError("Drive did not confirm resumable upload completion")
        return completed

    def upload_batch(self, results):
        verified = []
        for result in results:
            path = pathlib.Path(result["file"])
            relative = path.relative_to(LOCAL)
            if len(relative.parts) != 2 or path.suffix.lower() not in (".mp4", ".mkv", ".webm"):
                raise RuntimeError("Unexpected video path; refusing Drive upload")
            course_name, name = relative.parts
            parent_id = self.course_folder(course_name)
            expected_size = path.stat().st_size
            expected_md5 = digest(path)
            matches = [f for f in self.children(parent_id) if f.get("name") == name]
            if len(matches) > 1:
                raise RuntimeError(f"Multiple Drive files have the target name: {relative.as_posix()}")
            existing = matches[0] if matches else None
            if existing and existing.get("size") == str(expected_size) and existing.get("md5Checksum", "").lower() == expected_md5:
                remote = existing
            else:
                if existing and existing.get("mimeType") != "video/mp4":
                    raise RuntimeError(f"Drive target name exists with a non-video file: {relative.as_posix()}")
                remote = self.create_or_update_resumable(path, name, parent_id, existing)
                self.file_cache.pop(parent_id, None)
            # Confirm by fetching Drive metadata after upload, including the content hash.
            check = self.request("GET", API + "/files/" + quote(remote["id"], safe=""),
                                 params={"fields": "id,name,size,md5Checksum,parents,webViewLink,mimeType"})
            if not check.ok:
                raise RuntimeError(f"Drive metadata verification failed ({check.status_code})")
            remote = check.json()
            if int(remote.get("size", -1)) != expected_size or remote.get("md5Checksum", "").lower() != expected_md5:
                raise RuntimeError(f"Drive content hash verification failed: {relative.as_posix()}")
            relative_path = relative.as_posix()
            verified.append({
                **result,
                "relative_path": relative_path,
                "drive_file_id": remote["id"],
                "drive_url": f"https://drive.google.com/file/d/{remote['id']}/view",
                "md5": expected_md5,
                "status": "verified_on_drive",
            })
            with (WORK / "uploader-live.log").open("a", encoding="utf-8") as log:
                log.write(f"{datetime.now(timezone.utc).isoformat()} VERIFIED {relative_path} {expected_size} bytes md5={expected_md5}\n")
        return verified
