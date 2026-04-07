"""Main CLI entry point for the sample project."""

import sys
from sample_project.utils import greet


def main():
    """Main function to run the CLI."""
    if len(sys.argv) > 1:
        name = sys.argv[1]
    else:
        name = "World"
    
    message = greet(name)
    print(message)


if __name__ == "__main__":
    main()
