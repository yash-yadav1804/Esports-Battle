from pydantic import BaseModel, Field
class ProfileUpdate(BaseModel): name:str|None=None; ign:str|None=None; bgmiUID:str|None=None
