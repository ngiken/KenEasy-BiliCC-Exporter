import sys
import zipfile
from pathlib import Path


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def iter_extension_files(src_dir):
    for file_path in src_dir.rglob("*"):
        if not file_path.is_file():
            continue

        name = file_path.name
        if name.startswith(".") or name.endswith(".tmp") or name.endswith("~"):
            continue

        yield file_path


def zip_extension(src_dir, dest_zip, root_folder=None):
    src_dir = Path(src_dir)
    dest_zip = Path(dest_zip)
    print(f"Starting packaging of: {src_dir}")

    if not src_dir.exists():
      print(f"Error: Source directory {src_dir} does not exist.")
      return False

    with zipfile.ZipFile(dest_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file_path in iter_extension_files(src_dir):
            arcname = file_path.relative_to(src_dir).as_posix()
            if root_folder:
                arcname = f"{root_folder}/{arcname}"
            zipf.write(file_path, arcname)
            print(f"  Packed: {arcname}")

    print(f"Success! Created zip file at: {dest_zip}")
    return True


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[1]
    extension_dir = project_root / "chrome-extension"
    zip_extension(extension_dir, project_root / "KenEasy-BiliCC-Exporter-store.zip")
    zip_extension(
        extension_dir,
        project_root / "KenEasy-BiliCC-Exporter-manual-install.zip",
        root_folder="KenEasy-BiliCC-Exporter",
    )
