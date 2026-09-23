from enum import Enum
class Role(str, Enum):
    PLAYER = "player"
    ORGANIZER = "organizer"
    ADMIN = "admin"
    SUPER_ADMIN = "superAdmin"
