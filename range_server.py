import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, HTTPServer

class RangeRequestHandler(SimpleHTTPRequestHandler):
    """HTTP Request Handler with full HTTP 206 Byte Range support for streaming MP4 videos."""

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        total_length = fs.st_size
        ctype = self.guess_type(path)

        range_header = self.headers.get('Range')
        if not range_header or not range_header.startswith('bytes=') or total_length == 0:
            self.send_response(200)
            self.send_header("Content-type", ctype)
            self.send_header("Content-Length", str(total_length))
            self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
            self.end_headers()
            return f

        # Parse range header: e.g. "bytes=0-1024" or "bytes=1024-"
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if not range_match:
            self.send_error(416, "Requested Range Not Satisfiable")
            f.close()
            return None

        start_str, end_str = range_match.groups()
        start = int(start_str)
        end = int(end_str) if end_str else total_length - 1

        if start >= total_length:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{total_length}")
            self.end_headers()
            f.close()
            return None

        if end >= total_length:
            end = total_length - 1

        length = end - start + 1

        self.send_response(206)
        self.send_header("Content-type", ctype)
        self.send_header("Content-Range", f"bytes {start}-{end}/{total_length}")
        self.send_header("Content-Length", str(length))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.end_headers()

        f.seek(start)
        return RangeFileWrapper(f, length)

class RangeFileWrapper:
    def __init__(self, f, length):
        self.f = f
        self.remaining = length

    def read(self, size=-1):
        if self.remaining <= 0:
            return b""
        if size < 0 or size > self.remaining:
            size = self.remaining
        data = self.f.read(size)
        self.remaining -= len(data)
        return data

    def close(self):
        self.f.close()

def run(port=8080):
    os.chdir('c:/Peptide')
    server_address = ('', port)
    httpd = HTTPServer(server_address, RangeRequestHandler)
    print(f"Range-enabled HTTP server running at http://localhost:{port}/")
    sys.stdout.flush()
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run(port)
