from fastapi import APIRouter, Response, HTTPException
from Minio.config import download_file
import mimetypes

router = APIRouter(
    prefix="/media",
    tags=["Media"]
)

DEFAULT_AVATAR_SVG = b'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" fill="#262626">
<circle cx="75" cy="75" r="75"/>
<circle cx="75" cy="55" r="25" fill="#737373"/>
<path d="M75 90 C50 90 35 110 35 130 C45 142 60 150 75 150 C90 150 105 142 115 130 C115 110 100 90 75 90 Z" fill="#737373"/>
</svg>'''

@router.get("/{object_path:path}")
async def download_media(object_path: str):
    try:
        data = download_file(object_path)
    except Exception as e:
        first_segment = object_path.split("/")[0].lower() if "/" in object_path else object_path.lower()
        if first_segment in ("profile", "profiles", "avatar", "avatars"):
            return Response(
                content=DEFAULT_AVATAR_SVG,
                media_type="image/svg+xml",
                headers={"Content-Disposition": 'inline; filename="avatar.svg"'}
            )
        raise e
    
    filename = object_path.split("/")[-1]
    media_type, _ = mimetypes.guess_type(filename)
    if media_type is None:
        media_type = "application/octet-stream"
        
    return Response(
        content=data,
        media_type=media_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )
