from pydantic import BaseModel, Field, EmailStr
class RegisterRequest(BaseModel):
    name: str=Field(min_length=2,max_length=50); email: EmailStr; password: str=Field(min_length=6); ign: str=Field(min_length=1,max_length=100); bgmiUID: str=Field(pattern=r"^[0-9]{8,12}$")
class LoginRequest(BaseModel): email: EmailStr; password: str=Field(min_length=1)
