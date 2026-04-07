# Sample Python Project

This is a minimal sample Python project with a small package, a CLI entry, and tests.

## Quickstart (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m pytest -v
```

## Run the CLI

```powershell
python -m sample_project.main Alice
```

## Project Structure

```
enk_project/
├── src/
│   └── sample_project/
│       ├── __init__.py
│       ├── utils.py
│       └── main.py
├── tests/
│   └── test_utils.py
├── requirements.txt
├── .gitignore
└── README.md
```
