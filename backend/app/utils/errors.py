from fastapi import HTTPException
def bad_request(message): raise HTTPException(status_code=400,detail=message)
def not_found(message): raise HTTPException(status_code=404,detail=message)
def forbidden(message="Access Denied"): raise HTTPException(status_code=403,detail=message)
def conflict(message): raise HTTPException(status_code=409,detail=message)
