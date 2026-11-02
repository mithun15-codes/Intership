import secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from config import settings

KEY = bytes.fromhex(settings.AES_KEY)
aesgcm = AESGCM(KEY)

def encrypt(data: bytes) -> bytes:
    nonce = secrets.token_bytes(12)
    ciphertext = aesgcm.encrypt(nonce, data, None)
    return nonce + ciphertext

def decrypt(data: bytes) -> bytes:
    nonce = data[:12]
    ciphertext = data[12:]
    return aesgcm.decrypt(nonce, ciphertext, None)
