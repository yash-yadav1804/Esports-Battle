# Esports Battle Backend API Documentation

Base URL:

```http
http://localhost:5000
```

Authentication type:

```http
Bearer Token
```

Use token in Postman:

```text
Authorization → Bearer Token → paste JWT token
```

---

# 1. Auth APIs

## Register User

```http
POST /api/auth/register
```

Body:

```json
{
  "name": "Yash Player",
  "email": "player1@gmail.com",
  "password": "123456",
  "ign": "YashOP",
  "bgmiUID": "9876543210"
}
```

Access:

```text
Public
```

---

## Login User

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "player@gmail.com",
  "password": "123456"
}
```

Response:

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "Yash Player",
    "email": "player@gmail.com",
    "role": "player"
  }
}
```

Access:

```text
Public
```

---

# 2. Team APIs

## Create Team

```http
POST /api/teams/create
```

Body:

```json
{
  "teamName": "Team Alpha"
}
```

Access:

```text
Player
```

---

## Join Team Directly

```http
POST /api/teams/join/:teamId
```

Access:

```text
Player
```

---

## Get All Teams

```http
GET /api/teams
```

Access:

```text
Public
```

---

## Get Team By ID

```http
GET /api/teams/:teamId
```

Access:

```text
Public
```

---

## Leave Team

```http
PATCH /api/teams/leave
```

Access:

```text
Player
```

Rule:

```text
Normal player can leave team.
IGL cannot leave directly.
```

---

## IGL Remove Player

```http
PATCH /api/teams/remove-player/:playerId
```

Access:

```text
IGL only
```

Rule:

```text
Only IGL can remove players from his team.
IGL cannot remove himself.
```

---

## Transfer Captain

```http
PATCH /api/teams/transfer-captain/:newCaptainId
```

Access:

```text
Current IGL only
```

Rule:

```text
New captain must be a team member.
```

---

# 3. Team Request APIs

## Send Join Request

```http
POST /api/team-requests/send/:teamId
```

Access:

```text
Player
```

Effect:

```text
Creates team join request.
Sends notification to IGL.
```

---

## Get Team Requests

```http
GET /api/team-requests/team/:teamId
```

Access:

```text
IGL only
```

---

## Approve Team Request

```http
PATCH /api/team-requests/approve/:requestId
```

Access:

```text
IGL only
```

Effect:

```text
Adds player to team.
Sends notification to player.
```

---

## Reject Team Request

```http
PATCH /api/team-requests/reject/:requestId
```

Access:

```text
IGL only
```

Effect:

```text
Rejects join request.
Sends notification to player.
```

---

# 4. Tournament APIs

## Create Tournament

```http
POST /api/tournaments/createTournament
```

Body:

```json
{
  "title": "BGMI Championship 2026",
  "game": "BGMI",
  "mode": "Squad",
  "entryFee": 100,
  "prizePool": 3000,
  "maxTeams": 25,
  "startDate": "2026-08-01"
}
```

Access:

```text
Admin
```

---

## Get All Tournaments

```http
GET /api/tournaments
```

Access:

```text
Public
```

---

## Get Completed Tournament History

```http
GET /api/tournaments/history/completed
```

Access:

```text
Public
```

---

## Get Tournament By ID

```http
GET /api/tournaments/:tournamentId
```

Access:

```text
Public
```

---

## Register Team in Tournament

```http
POST /api/tournaments/register/:tournamentId
```

Access:

```text
Player
```

Rule:

```text
Player must be in a team.
Team should not already be registered.
Tournament should not be full.
```

---

## Leave Tournament

```http
POST /api/tournaments/leave/:tournamentId
```

Access:

```text
Player
```

Rule:

```text
Team can leave only before tournament starts.
```

---

## Start Tournament

```http
PATCH /api/tournaments/start/:tournamentId
```

Access:

```text
Admin
```

Effect:

```text
Changes status to live.
Sends tournament started notification to registered team players.
```

---

## Complete Tournament

```http
PATCH /api/tournaments/complete/:tournamentId
```

Access:

```text
Admin
```

Effect:

```text
Calculates winner.
Creates prize distribution.
Changes status to completed.
Sends tournament completed notification.
```

---

# 5. Match Room APIs

## Create Match Room

```http
POST /api/matchrooms/create/:tournamentId
```

Body:

```json
{
  "roomId": 12345678,
  "roomPassword": "BGMI123",
  "matchNumber": 1
}
```

Access:

```text
Admin
```

---

## Get All Match Rooms

```http
GET /api/matchrooms
```

Access:

```text
Public
```

---

# 6. Match Result APIs

## Add Match Result Directly

```http
POST /api/matchresults/add
```

Body:

```json
{
  "team": "TEAM_ID",
  "tournament": "TOURNAMENT_ID",
  "matchRoom": "MATCH_ROOM_ID",
  "kills": 10,
  "position": 1
}
```

Access:

```text
Admin
```

Effect:

```text
killPoints = kills × 2
placementPoints depends on position
totalPoints = killPoints + placementPoints
```

---

## Get All Match Results

```http
GET /api/matchresults
```

Access:

```text
Public
```

---

# 7. Result Submission APIs

## Player Submit Result

```http
POST /api/result-submissions/submit
```

Body:

```json
{
  "tournamentId": "TOURNAMENT_ID",
  "matchRoomId": "MATCH_ROOM_ID",
  "kills": 10,
  "position": 1
}
```

Access:

```text
Player
```

Effect:

```text
Creates pending result submission.
Admin approval required.
```

---

## Get My Submissions

```http
GET /api/result-submissions/my-submissions
```

Access:

```text
Player
```

---

## Get Pending Submissions

```http
GET /api/result-submissions/pending
```

Access:

```text
Admin
```

---

## Approve Result Submission

```http
PATCH /api/result-submissions/approve/:submissionId
```

Access:

```text
Admin
```

Effect:

```text
Creates final match result.
Updates leaderboard automatically.
Sends notification to player.
```

---

## Reject Result Submission

```http
PATCH /api/result-submissions/reject/:submissionId
```

Body:

```json
{
  "adminNote": "Screenshot is not clear. Please submit again."
}
```

Access:

```text
Admin
```

Effect:

```text
Rejects submission.
Sends notification to player.
```

---

# 8. Leaderboard APIs

## Get Tournament Leaderboard

```http
GET /api/leaderboard/:tournamentId
```

Access:

```text
Public
```

Response example:

```json
[
  {
    "rank": 1,
    "team": "team alpha pro",
    "points": 215
  }
]
```

---

# 9. Winner API

## Get Tournament Winner

```http
GET /api/winner/:tournamentId
```

Access:

```text
Public
```

Response example:

```json
{
  "rank": 1,
  "team": "team alpha pro",
  "points": 215
}
```

---

# 10. Prize APIs

## Get Prize Distribution

```http
GET /api/prizes/:tournamentId
```

Access:

```text
Public
```

Example for prizePool ₹3000:

```json
{
  "firstPlace": {
    "amount": 1500
  },
  "secondPlace": {
    "amount": 900
  },
  "thirdPlace": {
    "amount": 600
  }
}
```

---

## Generate Prize Distribution

```http
POST /api/prizes/generate/:tournamentId
```

Access:

```text
Admin / Internal
```

Note:

```text
In current flow, complete tournament already generates prize distribution.
```

---

# 11. Dashboard APIs

## Tournament Dashboard

```http
GET /api/dashboard/:tournamentId
```

Access:

```text
Public
```

Response includes:

```text
Tournament name
Game
Status
Total teams
Total rooms
Total results
Winner
Leaderboard
```

---

# 12. Admin APIs

## Get All Users

```http
GET /api/admin/users
```

Access:

```text
Admin
```

---

## Delete User

```http
DELETE /api/admin/users/:userId
```

Access:

```text
Admin
```

---

## Delete Team

```http
DELETE /api/admin/teams/:teamId
```

Access:

```text
Admin
```

---

## Update Team

```http
PATCH /api/admin/teams/:teamId
```

Body:

```json
{
  "teamName": "Team Alpha Pro",
  "maxPlayers": 5
}
```

Access:

```text
Admin
```

---

## Delete Tournament

```http
DELETE /api/admin/tournaments/:tournamentId
```

Access:

```text
Admin
```

Effect:

```text
Deletes tournament.
Deletes related match rooms.
Deletes related match results.
Deletes related prize distribution.
```

---

## Update Tournament

```http
PATCH /api/admin/tournaments/:tournamentId
```

Body:

```json
{
  "entryFee": 150,
  "prizePool": 3000,
  "maxTeams": 20
}
```

Access:

```text
Admin
```

---

## Admin Dashboard Stats

```http
GET /api/admin/dashboard-stats
```

Access:

```text
Admin
```

Response includes:

```text
Total users
Total players
Total admins
Total teams
Total tournaments
Upcoming tournaments
Live tournaments
Completed tournaments
Total match rooms
Total match results
Total prize distributed
```

---

# 13. Profile APIs

## Get My Profile

```http
GET /api/profile/me
```

Access:

```text
Logged-in user
```

---

## Get My Team

```http
GET /api/profile/my-team
```

Access:

```text
Logged-in user
```

---

## Get My Tournaments

```http
GET /api/profile/my-tournaments
```

Access:

```text
Logged-in user
```

---

## Get My Match History

```http
GET /api/profile/my-match-history
```

Access:

```text
Logged-in user
```

---

## Update My Profile

```http
PATCH /api/profile/update
```

Body:

```json
{
  "name": "Yash Player",
  "ign": "YashOP",
  "bgmiUID": "9876543210"
}
```

Access:

```text
Logged-in user
```

---

# 14. Notification APIs

## Get My Notifications

```http
GET /api/notifications/my
```

Access:

```text
Logged-in user
```

---

## Mark Notification as Read

```http
PATCH /api/notifications/read/:notificationId
```

Access:

```text
Notification owner
```

---

## Mark All Notifications as Read

```http
PATCH /api/notifications/read-all
```

Access:

```text
Logged-in user
```

---

# Common Rules

## Admin Token Required For

```text
Create tournament
Start tournament
Complete tournament
Create match room
Approve result submission
Reject result submission
Admin dashboard stats
Delete user
Delete team
Delete tournament
Update team
Update tournament
```

## Player Token Required For

```text
Create team
Join team
Send team request
Register team in tournament
Leave tournament
Submit result
Check profile
Check notifications
```

## Public APIs

```text
Get all tournaments
Get tournament by ID
Get all teams
Get team by ID
Get leaderboard
Get winner
Get prize distribution
Get tournament history
Get dashboard
```

---

# Backend Flow Summary

```text
User registers/login
        ↓
Player creates or joins team
        ↓
Team registers in tournament
        ↓
Admin starts tournament
        ↓
Admin creates match room
        ↓
Player submits result
        ↓
Admin approves result
        ↓
Leaderboard updates
        ↓
Admin completes tournament
        ↓
Winner + prize distribution generated
        ↓
Notifications sent to players

```
