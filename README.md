# Quadance Technologies — Internship Projects Repository

**Author:** Mithun Mohan  
**Academic Programme:** B.Tech Computer Science (Fourth Year), St. Thomas College of Engineering and Technology, Kozhuvalloor, Chengannur  
**Organisation:** Quadance Technologies  
**Mentors:** Mr. Arjun Pradeep Kumar & Mr. Frederick Lenin D  
**GitHub Repository:** [mithun15-codes/mini_instagram](https://github.com/mithun15-codes/mini_instagram)

---

## Overview

This repository consolidates the three primary engineering workstreams completed during the internship at **Quadance Technologies**:

1. **[Task 1: Text-to-JSON Data Pipeline with Excel Export](#1-task-1-text-to-json-data-pipeline-with-excel-export)** — A data engineering pipeline that safely parses structured Python/JSON literal assignments from raw text files, performs statistical aggregation using Pandas, and exports clean tabular workbooks to Microsoft Excel (`.xlsx`).
2. **[Task 2: OCR Pipeline for PDF Document Processing](#2-task-2-ocr-pipeline-for-pdf-document-processing)** — An end-to-end computer vision and Optical Character Recognition (OCR) pipeline that renders PDF pages into high-resolution raster images using PyMuPDF and extracts structured text with spatial bounding-box coordinates via Tesseract OCR.
3. **[Task 3: Full-Stack Backend Development — Instagram Mini with MinIO](#3-task-3-full-stack-backend-development--instagram-mini-with-minio)** — A production-grade, asynchronous RESTful social media platform built with FastAPI, PostgreSQL (Async SQLAlchemy), MongoDB (Motor), Role-Based Access Control (RBAC), dual-token OAuth2 JWT security, and self-hosted MinIO S3-compatible object storage with end-to-end AES encryption/decryption for all uploaded media.

---

## Repository Structure

```text
d:\Internship\Tasks\
├── Text-to-JSON Data Pipeline with Excel Export/
│   ├── main.py                  # Pipeline entry point (load, analyze, export)
│   ├── student_details.txt      # Input text file with Python/JSON list assignment
│   ├── student.xlsx             # Generated Microsoft Excel output
│   └── requirements.txt         # Python dependencies (pandas, openpyxl)
│
├── OCR Pipeline for PDF Document Processing/
│   ├── main.py                  # Pdf pipeline class with concurrent OCR execution
│   ├── IEEE.pdf                 # Sample multi-page PDF input document
│   ├── page_1.png ... page_14.png       # Rendered raster page images
│   ├── output_1.json ... output_14.json # Extracted text & bounding-box metadata per page
│   └── requirements.txt         # Python dependencies (PyMuPDF, pytesseract, etc.)
│
└── Mini Instagram - Full Stack Social Media Platform/
    ├── main.py                  # FastAPI application entry point & lifespan manager
    ├── config.py                # Application & environment configuration
    ├── models.py                # SQLAlchemy ORM models (Users, Posts, Reels, Stories, RBAC)
    ├── tables.py                # Database table definitions
    ├── docker-compose.yml       # Container orchestration (PostgreSQL, MongoDB, MinIO)
    ├── alembic/                 # Database migrations
    ├── Auth/                    # JWT token management, password hashing, RBAC permissions
    ├── Database/                # Async PostgreSQL session & Motor MongoDB configuration
    ├── Minio/                   # MinIO bucket client & AES encryption/decryption layer
    ├── Insta_er/                # Entity-Relationship diagrams (DBML)
    └── User/
        ├── CRUD/                # Decoupled database operations per domain
        ├── Routers/             # Modular FastAPI route handlers
        ├── Schemas/             # Pydantic request/response validation schemas
        └── Frontend/            # Vanilla HTML5, CSS3, JavaScript SPA
```

---

## 1. Task 1: Text-to-JSON Data Pipeline with Excel Export

**Directory:** [`Text-to-JSON Data Pipeline with Excel Export`](./Text-to-JSON%20Data%20Pipeline%20with%20Excel%20Export)

### What It Does
Reads a raw text file (`student_details.txt`) containing a Python variable assignment of student records (`student_details = [{'Student_ID': 101, ...}, ...]`), safely extracts and parses the structured list into JSON-equivalent records, computes analytical distributions (gender breakdown, grade distribution, department-wise counts) using **Pandas**, prints a formatted summary report to the console, and exports the dataset into a clean, machine-readable Microsoft Excel workbook (`student.xlsx`).

### Tech Stack

| Component | Technology / Library |
| :--- | :--- |
| **Language** | Python 3 |
| **File I/O** | Python `pathlib.Path` / built-in `open()` with UTF-8 encoding |
| **Data Parsing & JSON Conversion** | `ast.literal_eval()` & `json.loads()` / `json.dumps()` |
| **Data Manipulation & Analytics** | `pandas` (`DataFrame`, `value_counts()`, `groupby()`) |
| **Excel Export** | `pandas.DataFrame.to_excel()` via `openpyxl` backend |

### How It Works (Pipeline Architecture)

1. **Stage 1 — File Reading with Exception Handling:**  
   Reads `student_details.txt` inside structured `try / except` blocks to verify file existence and handle I/O errors gracefully. Each record contains `Student_ID`, `Name`, `Age`, `Gender`, `Grade`, `Department`, and `City`.
2. **Stage 2 — Safe Parsing & JSON Conversion:**  
   Splits the raw file content only on the **first occurrence** of the `=` character (`content.split("=", 1)[1].strip()`) so that any `=` characters inside data values do not corrupt the split. Evaluates the literal safely using `ast.literal_eval()` / `json.loads()` instead of `eval()` to prevent arbitrary code execution vulnerabilities.
3. **Stage 3 — Pandas DataFrame Construction & Analysis:**  
   Converts the parsed list of dictionaries into a `pd.DataFrame` and computes:
   - Total student count
   - Gender distribution (Male vs. Female)
   - Grade distribution via `df["Grade"].value_counts()`
   - Department-wise student counts via `df["Department"].value_counts()`
4. **Stage 4 — Excel Export:**  
   Exports the structured DataFrame to `student.xlsx` using `df.to_excel(output_path, index=False)` powered by `openpyxl`.

### Running Task 1
```powershell
cd "Text-to-JSON Data Pipeline with Excel Export"
pip install -r requirements.txt
python main.py
```

---

## 2. Task 2: OCR Pipeline for PDF Document Processing

**Directory:** [`OCR Pipeline for PDF Document Processing`](./OCR%20Pipeline%20for%20PDF%20Document%20Processing)

### What It Does
An end-to-end Optical Character Recognition (OCR) pipeline that ingests multi-page PDF documents (`IEEE.pdf`), renders each page into a high-resolution raster image (`page_1.png` ... `page_N.png`), runs **Tesseract OCR** concurrently across CPU threads to extract text tokens along with their exact spatial bounding-box coordinates (`x`, `y`, `width`, `height`), and outputs structured per-page JSON files (`output_1.json` ... `output_N.json`) for downstream spatial layout reconstruction.

### Tech Stack

| Component | Technology / Library |
| :--- | :--- |
| **Language** | Python 3 |
| **PDF Rendering** | `PyMuPDF` (`fitz`) — `page.get_pixmap()` |
| **Image Preprocessing** | OpenCV / Pillow (PIL) |
| **OCR Engine** | Tesseract OCR via `pytesseract` (`image_to_data` with `Output.DICT`) |
| **Concurrency** | Python `concurrent.futures.ThreadPoolExecutor` |
| **Spatial Layout & Serialization** | Custom bounding-box coordinate extraction & `json` module |

### How It Works (Pipeline Architecture)

1. **Stage 1 — PDF-to-Image Conversion:**  
   Opens the input PDF with `fitz.open()` (`PyMuPDF`) and renders each page into a high-resolution PNG raster image (`page.get_pixmap()`) at configurable DPI (200–300 DPI) to preserve small or thin typefaces.
2. **Stage 2 — Image Preprocessing:**  
   Supports greyscale conversion, adaptive thresholding/binarisation, morphological noise reduction, and deskewing to maximise OCR recognition confidence.
3. **Stage 3 — Concurrent OCR Execution with Positional Metadata:**  
   Uses `ThreadPoolExecutor` across available CPU cores to invoke `pytesseract.image_to_data(..., output_type=pytesseract.Output.DICT)` on each rendered page image. Extracts non-empty text tokens alongside their bounding box coordinates (`left`, `top`, `width`, `height`) and filters out low-confidence noise.
4. **Stage 4 — Spatial Layout Reconstruction & JSON Output:**  
   Projects word bounding boxes onto horizontal and vertical axes (gap-based x-axis column segmentation and y-coordinate proximity clustering for row merging) and writes structured JSON output files (`output_1.json`, etc.) for every page.

### Running Task 2
```powershell
cd "OCR Pipeline for PDF Document Processing"
pip install -r requirements.txt
python main.py
```
*(Note: Ensure [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) is installed on your system. On Windows, `main.py` automatically detects `C:\Program Files\Tesseract-OCR\tesseract.exe` if not on `PATH`.)*

---

## 3. Task 3: Full-Stack Backend Development — Instagram Mini with MinIO

**Directory:** [`Mini Instagram - Full Stack Social Media Platform`](./Mini%20Instagram%20-%20Full%20Stack%20Social%20Media%20Platform)

### What It Does
**Instagram Mini** is a full-stack social media platform modelled on Instagram's core feature set. It provides user authentication, profiles, biographies, bidirectional follow graphs, feed posts, video reels, 24-hour expiring stories, likes, comments, saved posts/reels, and administrative moderation.

Its defining architectural highlight is **end-to-end media security**: all user-uploaded images and videos are encrypted using **AES** before being stored in a self-hosted, S3-compatible **MinIO** object storage cluster, and decrypted on the fly when streamed back to clients. Furthermore, it combines **PostgreSQL** (for relational social graph & RBAC data) with **MongoDB** (for asynchronous settings and configuration management).

### Tech Stack

| Component | Technology / Library |
| :--- | :--- |
| **Backend Web Framework** | FastAPI (Python, Asynchronous) |
| **Relational Database & ORM** | PostgreSQL + SQLAlchemy (AsyncIO `AsyncEngine` & `AsyncSession`) |
| **Database Migrations** | Alembic |
| **NoSQL Database** | MongoDB via `Motor` AsyncIO driver |
| **Object Storage** | MinIO (Self-hosted S3-compatible storage) |
| **Media Security / Encryption** | AES Cipher (`PyCryptodome` / `cryptography`) — Encrypt-then-Store & Fetch-then-Decrypt |
| **Authentication & Session Security** | Stateful OAuth2 JWT (Short-lived Access Token + Server-persisted Refresh Token) & Passlib/Bcrypt |
| **Authorization** | Enterprise Role-Based Access Control (RBAC) |
| **Data Validation** | Pydantic v2 Schemas (`User/Schemas/`) |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript Single Page Application (SPA) |
| **Infrastructure** | Docker & Docker Compose (`docker-compose.yml`) |

### How It Works (System Architecture)

#### 1. Modular Router & Dependency Injection Architecture
The entry point (`main.py`) uses FastAPI's `lifespan` context manager to verify MongoDB connectivity (`ping_mongo()`) and initialize MinIO buckets (`init_minio()`) at startup. API traffic is organized into domain-specific modular routers under `User/Routers/`:
- **Authentication & Users:** `auth.py`, `user_r.py`, `follower_r.py`
- **Posts & Engagement:** `post_r.py`, `post_like_r.py`, `post_comment_r.py`, `saved_post_r.py`
- **Reels & Engagement:** `reel_r.py`, `reel_likes_r.py`, `reel_comment_r.py`, `saved_reel_r.py`
- **Stories & Media Streaming:** `story_r.py`, `media_r.py`

All database queries are decoupled into `User/CRUD/`, and request/response payloads are strictly validated through Pydantic schemas in `User/Schemas/`.

#### 2. Dual-Database Design (PostgreSQL + MongoDB)
- **PostgreSQL (via Async SQLAlchemy):** Manages normalized relational entities:
  - **Core User Entities:** `users` (credentials, profile metadata, MinIO avatar reference, timestamps) and `user_bio` (enforces a single active biography per user).
  - **Content Entities:** `post` (feed posts with caption and MinIO object key), `reels` (short videos with cascading user deletion), and `stories` (ephemeral posts with 24-hour `expires_at` enforcement).
  - **Social & Interactive Entities:** `user_followers` (bidirectional follow graph with uniqueness constraints), `post_likes`, `post_comments`, `reel_likes`, `reel_comments`, `saved_posts`, and `saved_reels`.
  - **Enterprise RBAC Entities:** `roles` (`SuperAdmin`, `Admin`, `Supervisor`, `User`), `user_roles`, `features` / `actions`, and `role_feature_actions` (granular permission junction table).
- **MongoDB (via Motor AsyncIO):** Provides schema-free document storage (`Database/mongo.py`) for dynamic application-level settings, feature flags, and storage configuration without blocking the FastAPI event loop.

#### 3. Stateful Dual-Token OAuth2 JWT Authentication & RBAC
- Upon login, the server issues a **short-lived Access Token** and a **long-lived Refresh Token** (`Auth/jwt.py`).
- Refresh tokens are persisted server-side, enabling explicit session revocation.
- Route dependencies (`Auth/deps.py` and `Auth/permissions.py`) validate JWT signatures, bind the request to an authenticated user context, and enforce granular RBAC permissions before executing business logic.

#### 4. MinIO Object Storage with AES Encryption & Decryption
- **Encrypt-then-Store (Upload):** When a user uploads an image or video, the raw byte stream is intercepted before reaching MinIO. `Minio/encryption.py` applies an **AES-256 cipher** using a server-managed secret key (loaded via environment variables), and only the encrypted ciphertext payload is uploaded to the MinIO bucket (`Minio/config.py`).
- **Fetch-then-Decrypt (Retrieval):** When the frontend requests media for feed display, reel playback, or stories (`User/Routers/media_r.py`), the backend streams the encrypted object from MinIO, decrypts the payload in memory using the AES key and IV/nonce, and serves the plaintext stream with the appropriate MIME type (`image/jpeg`, `video/mp4`, etc.). No plaintext media is ever stored at rest.

#### 5. Vanilla JS Single Page Application (SPA) Frontend
- Located in `User/Frontend/`, the client application is built with framework-free HTML5, CSS3, and Vanilla JavaScript.
- A centralized `fetchAPI()` utility automatically injects `Authorization: Bearer <token>` headers, handles silent token refresh on `401 Unauthorized` responses, and implements client-side optimisations such as request debouncing and parallel loading limits.

### Running Task 3
```powershell
cd "Mini Instagram - Full Stack Social Media Platform"

# 1. Start backing services (PostgreSQL, MongoDB, MinIO) via Docker Compose
docker-compose up -d

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Run database migrations
alembic upgrade head

# 4. Launch the FastAPI server
uvicorn main:app --reload
```
Once running, access the interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

#   I n t e r s h i p  
 