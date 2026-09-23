from enum import Enum
class TournamentStatus(str, Enum):
    UPCOMING="upcoming"; LIVE="live"; COMPLETED="completed"
class ResultStatus(str, Enum):
    PENDING="pending"; APPROVED="approved"; REJECTED="rejected"
class TeamRequestStatus(str, Enum):
    PENDING="pending"; ACCEPTED="accepted"; REJECTED="rejected"
class NotificationType(str, Enum):
    TEAM_REQUEST="team_request"; RESULT_SUBMISSION="result_submission"; TOURNAMENT="tournament"; PRIZE="prize"; GENERAL="general"
class MatchStatus(str, Enum):
    UPCOMING="upcoming"; LIVE="live"; COMPLETED="completed"
