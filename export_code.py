"""
Script untuk mengekstrak seluruh file source code ke dalam folder 'logs'.
Fitur:
- Kompatibel dengan semua versi Python (Python 3.8+).
- Otomatis membuat folder 'logs/' jika belum ada.
- Menolak/melewati seluruh file konfigurasi rahasia (.env, .env.local, .env.*).
- Mengabaikan folder besar/non-source (node_modules, .next, .git, dist, build, logs).
- Mengabaikan file biner (gambar, font, video, database file).
- Mengabaikan lockfile raksasa (package-lock.json, yarn.lock, pnpm-lock.yaml).
- Menghasilkan file log berformat rapi dengan encoding UTF-8 utuh.
"""

import os
from datetime import datetime
from pathlib import Path

# Direktori dasar (akar proyek di mana script ini dijalankan)
BASE_DIR = Path(__file__).resolve().parent

# Folder output log
LOGS_DIR = BASE_DIR / "logs"
OUTPUT_FILE = LOGS_DIR / "project_code_dump.log"

# Folder yang WAJIB dilewati (tidak discan)
EXCLUDE_DIRS = {
    "node_modules",
    ".next",
    ".git",
    ".vscode",
    ".idea",
    "logs",
    "dist",
    "build",
    "coverage",
    "__pycache__",
    ".gemini",
}

# Ekstensi file biner/media yang tidak perlu diekspor
EXCLUDE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".ico",
    ".svg",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".otf",
    ".mp4",
    ".mp3",
    ".wav",
    ".webm",
    ".pdf",
    ".zip",
    ".tar",
    ".gz",
    ".7z",
    ".exe",
    ".dll",
    ".so",
    ".bin",
    ".db",
    ".sqlite",
    ".sqlite3",
    ".pyc",
}

# File spesifik yang dilewati (rahasia atau terlalu besar/auto-generated)
EXCLUDE_EXACT_FILES = {
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "exported_code.log",
}


def is_env_file(file_path: Path) -> bool:
    """Mengecek apakah file adalah file env rahasia."""
    name = file_path.name.lower()
    return name == ".env" or name.startswith(".env.") or name.endswith(".env")


def should_process_file(file_path: Path) -> bool:
    """Menentukan apakah file layak dibaca dan diekspor."""
    # 1. Lindungi file .env (WAJIB dilewati)
    if is_env_file(file_path):
        return False

    # 2. Lewati file dalam daftar blacklist
    if file_path.name in EXCLUDE_EXACT_FILES:
        return False

    # 3. Lewati ekstensi media / biner
    if file_path.suffix.lower() in EXCLUDE_EXTENSIONS:
        return False

    # 4. Jangan membaca file output itu sendiri
    if file_path.resolve() == OUTPUT_FILE.resolve():
        return False

    return True


def export_project_code():
    # Pastikan folder logs tersedia
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("Memulai proses ekstraksi kode sumber proyek...")
    print(f"Direktori akar : {BASE_DIR}")
    print(f"Output tujuan   : {OUTPUT_FILE}")
    print("==================================================\n")

    files_to_export = []

    # Scanning file secara rekursif
    for root, dirs, files in os.walk(BASE_DIR):
        # Filter direktori yang dilarang agar tidak discan lebih dalam
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]

        root_path = Path(root)
        for file_name in files:
            file_path = root_path / file_name
            if should_process_file(file_path):
                files_to_export.append(file_path)

    # Urutkan berdasarkan path relatif agar rapi
    files_to_export.sort(key=lambda p: str(p.relative_to(BASE_DIR)).lower())

    total_files = len(files_to_export)
    total_lines = 0
    exported_count = 0
    skipped_count = 0

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        # Header Log File
        out.write("=" * 80 + "\n")
        out.write("EINCSHOP - FULL CODEBASE DUMP\n")
        out.write(f"Diekspor pada : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        out.write(f"Total berkas  : {total_files} file ditemukan\n")
        out.write(
            "Catatan       : Seluruh file .env dan file biner telah otomatis disaring/dilewati.\n"
        )
        out.write("=" * 80 + "\n\n")

        for idx, file_path in enumerate(files_to_export, 1):
            rel_path = file_path.relative_to(BASE_DIR)
            try:
                content = file_path.read_text(encoding="utf-8")
                lines = content.count("\n") + (1 if content else 0)
                total_lines += lines
                exported_count += 1

                out.write("=" * 80 + "\n")
                out.write(f"FILE [{idx}/{total_files}]: {rel_path} ({lines} baris)\n")
                out.write("=" * 80 + "\n")
                out.write(content)
                out.write(
                    f"\n\n-------------------- [END OF: {rel_path}] --------------------\n\n"
                )

                print(f"[{idx}/{total_files}] OK: {rel_path} ({lines} baris)")

            except UnicodeDecodeError:
                # File bukan teks UTF-8 murni (misal biner yang lolos)
                skipped_count += 1
                print(f"[{idx}/{total_files}] SKIP (Bukan teks UTF-8): {rel_path}")
            except Exception as e:
                skipped_count += 1
                print(f"[{idx}/{total_files}] ERROR membaca {rel_path}: {e}")

        # Footer Log File
        out.write("\n" + "=" * 80 + "\n")
        out.write("RINGKASAN EKSPOR KODE:\n")
        out.write(f"- Berhasil diekspor : {exported_count} file\n")
        out.write(f"- Dilewati / Gagal  : {skipped_count} file\n")
        out.write(f"- Total baris kode  : {total_lines} baris\n")
        out.write("=" * 80 + "\n")

    print("\n==================================================")
    print("PROSES SELESAI!")
    print(f"Total file diekspor : {exported_count}")
    print(f"Total baris kode    : {total_lines:,}")
    print(f"File log tersimpan  : {OUTPUT_FILE}")
    print("==================================================")


if __name__ == "__main__":
    export_project_code()
