from minio import Minio
import uuid
from io import BytesIO
from config import settings
from Minio.encryption import encrypt, decrypt
from fastapi import HTTPException
from cryptography.exceptions import InvalidTag

client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=False
)
BUCKET = settings.MINIO_BUCKET

# Auto-create the bucket if it does not exist
def init_minio():
    try:
        if not client.bucket_exists(BUCKET):
            client.make_bucket(BUCKET)
    except Exception as e:
        print(f"Warning: Failed to initialize Minio bucket: {e}")

def upload_file(file, folder: str):
    clean_folder = folder.strip("/")
    filename = f"{uuid.uuid4()}-{file.filename}"
    object_name = f"{clean_folder}/{filename}"

    content = file.file.read()
    encrypted = encrypt(content)

    client.put_object(
        BUCKET,
        object_name,
        BytesIO(encrypted),
        length=len(encrypted),
        part_size=10 * 1024 * 1024,
        content_type=file.content_type
    )

    return f"/media/{clean_folder}/{filename}"

def download_file(object_name: str) -> bytes:
    try:
        response = client.get_object(BUCKET, object_name)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Media not found: {object_name}")
    try:
        encrypted = response.read()
    finally:
        response.close()
        response.release_conn()

    try:
        return decrypt(encrypted)
    except (InvalidTag, ValueError, Exception) as e:
        # Decryption failed — the file was encrypted with a different AES key
        # (e.g. an old key that is no longer available). The object must be
        # re-uploaded through the API so it is re-encrypted with the current key.
        raise HTTPException(
            status_code=410,
            detail=(
                f"Media '{object_name}' was encrypted with an old AES key and "
                "cannot be decrypted. Please delete it from MinIO and re-upload "
                "the file through the application."
            )
        )


def delete_file(media_url: str):
    if not media_url:
        return
    clean_path = media_url
    if clean_path.startswith("/media/"):
        clean_path = clean_path[len("/media/"):]
    elif clean_path.startswith("/"):
        clean_path = clean_path.lstrip("/")
        
    try:
        client.remove_object(BUCKET, clean_path)
        print(f"Successfully removed '{clean_path}' from MinIO bucket '{BUCKET}'")
    except Exception as e:
        print(f"Warning: Failed to delete object '{clean_path}' from MinIO: {e}")
