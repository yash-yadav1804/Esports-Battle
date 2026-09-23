from pydantic import BaseModel, Field
class OrganizerRequestCreate(BaseModel): organizationName:str=Field(min_length=1); contactNumber:str=Field(min_length=1); reason:str=Field(min_length=1); experience:str=""; socialLink:str=""
class OrganizerReview(BaseModel): adminNote:str=""
