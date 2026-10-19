import subprocess
import sys
from pathlib import Path

# Always write next to this script, regardless of where it's run from
REQUIREMENTS_PATH = Path(__file__).parent / "requirements.txt"

def update_requirements():
    # Refuse to run outside the container, otherwise we'd freeze the host's Python
    if not Path("/.dockerenv").exists():
        print("Error: run this script inside the dev container, not on your machine.")
        sys.exit(1)

    print("Freezing current environment into requirements.txt...")

    # Run 'pip freeze' and capture the text output
    result = subprocess.run(
        [sys.executable, "-m", "pip", "freeze"],
        capture_output=True,
        text=True,
        check=True
    )

    # Open/create requirements.txt and write the captured output
    with open(REQUIREMENTS_PATH, "w", encoding="utf-8") as f:
        f.write(result.stdout)

    print(f"Success! {REQUIREMENTS_PATH} has been updated.")

if __name__ == "__main__":
    update_requirements()


# import subprocess
# import sys
# from pathlib import Path

# # Always work next to this script, regardless of where it's run from
# BACKEND_DIR = Path(__file__).parent
# REQUIREMENTS_IN = BACKEND_DIR / "requirements.in"

# def run_piptools(*args):
#     # Run from the backend folder so the generated file header shows clean relative paths
#     subprocess.run([sys.executable, "-m", "piptools", *args], cwd=BACKEND_DIR, check=True)

# def update_requirements():
#     # Refuse to run outside the container, otherwise we'd touch the host's Python
#     if not Path("/.dockerenv").exists():
#         print("Error: run this script inside the dev container, not on your machine.")
#         sys.exit(1)

#     if not REQUIREMENTS_IN.exists():
#         print("Error: requirements.in not found. List your direct dependencies there first.")
#         sys.exit(1)

#     print("Resolving dependencies from requirements.in...")
#     run_piptools("compile", "--quiet", "--output-file", "requirements.txt", "requirements.in")

#     print("Syncing environment to match requirements.txt...")
#     run_piptools("sync", "requirements.txt")

#     print("Success! requirements.txt is updated and the environment matches it.")

# if __name__ == "__main__":
#     update_requirements()
