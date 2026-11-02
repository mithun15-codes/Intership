"""Text-to-JSON Data Pipeline with Excel Export.

This module reads student data from a text file containing JSON-formatted
records, parses and analyzes the dataset using pandas, displays key summary
statistics, and exports the clean structured data to an Excel workbook.
"""

from pathlib import Path
import json
import sys
import pandas as pd


def load_student_data(file_path: Path) -> pd.DataFrame:
    """Read and parse student records from a text file containing JSON data."""
    if not file_path.exists():
        raise FileNotFoundError(f"Input file not found: {file_path}")

    print(f"Reading {file_path.name}...\n")
    content = file_path.read_text(encoding="utf-8")

    # Extract JSON string following the assignment operator
    if "=" not in content:
        raise ValueError("Invalid format: expected variable assignment (e.g. 'student_details = [...]')")

    json_str = content.split("=", 1)[1].strip()
    records = json.loads(json_str)

    print(f"{len(records)} student records loaded successfully.\n")
    return pd.DataFrame(records)


def display_pipeline_summary(df: pd.DataFrame) -> None:
    """Compute and display summary statistics and distributions."""
    print(df)
    print()

    # Summary Statistics
    total_students = len(df)
    gender_counts = df["Gender"].value_counts()
    male_students = gender_counts.get("Male", 0)
    female_students = gender_counts.get("Female", 0)

    print("Summary Statistics")
    print("------------------")
    print(f"Total Students      : {total_students}")
    print(f"Male Students       : {male_students}")
    print(f"Female Students     : {female_students}")

    # Grade Distribution
    print("\nGrade Distribution")
    print("------------------")
    grade_counts = df["Grade"].value_counts()
    for grade, count in grade_counts.items():
        print(f"Grade {grade} : {count}")

    # Department Distribution
    print("\nDepartment Distribution")
    print("-----------------------")
    dept_counts = df["Department"].value_counts()
    for dept, count in dept_counts.items():
        print(f"Department {dept} : {count}")


def export_to_excel(df: pd.DataFrame, output_path: Path) -> None:
    """Export DataFrame to Excel without redundant index column."""
    print("\nExporting data to Excel...")
    df.to_excel(output_path, index=False)
    print(f"{output_path.name} created successfully.")


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    input_file = base_dir / "student_details.txt"
    output_file = base_dir / "student.xlsx"

    try:
        df = load_student_data(input_file)
        display_pipeline_summary(df)
        export_to_excel(df, output_file)
        print("Program completed successfully.")
    except Exception as exc:
        print(f"Error executing pipeline: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
