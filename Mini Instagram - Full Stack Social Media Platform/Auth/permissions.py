from fastapi import Depends, HTTPException
from Auth.deps import get_current_user

def require_roles(*roles):
    def checker(current_user=Depends(get_current_user)):
        user_role = current_user.role.role_name if current_user.role else None
        if user_role not in roles:
            raise HTTPException(status_code=403,detail="Permission denied")

        return current_user
    return checker
