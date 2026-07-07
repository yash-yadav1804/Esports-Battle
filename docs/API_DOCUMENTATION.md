# Esports Battle API Documentation

Esports Battle is a full-stack MERN esports tournament management platform. This API supports authentication, role-based access, teams, tournaments, match rooms, organizer requests, result submissions, admin workflows, and notifications.

---

## Base URLs

### Local Backend

```text
http://localhost:5000/api
```

### Deployed Backend

```text
https://esports-battle-api.onrender.com/api
```

---

## Authentication

Protected routes require a JWT token in the request header.

```http
Authorization: Bearer <token>
```

---

## User Roles

| Role | Description |
|---|---|
| `player` | Default user role. Can create/join teams, register tournaments, and submit results. |
| `organizer` | Can create/manage own tournaments and match rooms, and review own tournament results. |
| `admin` | Can manage platform users, teams, organizers, tournaments, and results. |
| `superAdmin` | Full platform-level control. |

---

# 1. Auth APIs

Base path:

```text
/api/auth
```

## Register User

```http
POST /api/auth/register
```

**Access:** Public

### Request Body

```json
{
  "name": "Yash Yadav",
  "email": "yash@example.com",
  "password": "Password123",
  "ign": "YashOP",
  "bgmiUID": "1234567890"
}
```

### Success Response

```json
{
  "message": "User registered successfully",
  "userId": "user_id_here"
}
```

## Login User

```http
POST /api/auth/login
```

**Access:** Public

### Request Body

```json
{
  "email": "yash@example.com",
  "password": "Password123"
}
```

### Success Response

```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id_here",
    "name": "Yash Yadav",
    "email": "yash@example.com",
    "role": "player"
  }
}
```

---

# 2. Profile APIs

Base path:

```text
/api/profile
```

## Get My Profile

```http
GET /api/profile/me
```

**Access:** Protected

## Get My Tournaments

```http
GET /api/profile/my-tournaments
```

**Access:** Protected

Returns tournaments where the user's team is registered.

## Get My Match History

```http
GET /api/profile/my-match-history
```

**Access:** Protected

Returns the user's match/result history.

---

# 3. Team APIs

Base path:

```text
/api/teams
```

## Create Team

```http
POST /api/teams/create
```

**Access:** Protected

### Request Body

```json
{
  "teamName": "Alpha Warriors"
}
```

## Join Team Directly

```http
POST /api/teams/join/:teamId
```

**Access:** Protected

## Get All Teams

```http
GET /api/teams
```

**Access:** Public

## Get My Team

```http
GET /api/teams/my-team
```

**Access:** Protected

## Get Team By ID

```http
GET /api/teams/:teamId
```

**Access:** Public

## Leave Team

```http
PATCH /api/teams/leave
```

**Access:** Protected

## Remove Player From Team

```http
PATCH /api/teams/remove-player/:playerId
```

**Access:** Protected, Team Captain

## Transfer Captain

```http
PATCH /api/teams/transfer-captain/:newCaptainId
```

**Access:** Protected, Current Team Captain

---

# 4. Team Request APIs

Base path:

```text
/api/team-requests
```

## Send Join Request

```http
POST /api/team-requests/send/:teamId
```

**Access:** Protected

## Get Team Requests

```http
GET /api/team-requests/team/:teamId
```

**Access:** Protected, Team Captain

## Approve Join Request

```http
PATCH /api/team-requests/approve/:requestId
```

**Access:** Protected, Team Captain

## Reject Join Request

```http
PATCH /api/team-requests/reject/:requestId
```

**Access:** Protected, Team Captain

---

# 5. Tournament APIs

Base path:

```text
/api/tournaments
```

## Create Tournament

```http
POST /api/tournaments/createTournament
```

**Access:** Protected, Organizer/Admin/SuperAdmin

### Request Body

```json
{
  "title": "BGMI Weekend Cup",
  "game": "BGMI",
  "description": "Squad tournament for registered teams",
  "entryFee": 0,
  "prizePool": 5000,
  "maxTeams": 16,
  "startDate": "2026-07-20T10:00:00.000Z"
}
```

## Get All Tournaments

```http
GET /api/tournaments
```

**Access:** Public

## Get My Created Tournaments

```http
GET /api/tournaments/my-created
```

**Access:** Protected, Organizer/Admin/SuperAdmin

## Get Completed Tournament History

```http
GET /api/tournaments/history/completed
```

**Access:** Public

## Get Tournament By ID

```http
GET /api/tournaments/:tournamentId
```

**Access:** Public

## Register Team For Tournament

```http
POST /api/tournaments/register/:tournamentId
```

**Access:** Protected

## Leave Tournament

```http
POST /api/tournaments/leave/:tournamentId
```

**Access:** Protected

## Start Tournament

```http
PATCH /api/tournaments/start/:tournamentId
```

**Access:** Protected, Organizer/Admin/SuperAdmin

## Complete Tournament

```http
PATCH /api/tournaments/complete/:tournamentId
```

**Access:** Protected, Organizer/Admin/SuperAdmin

## Update Tournament

```http
PATCH /api/tournaments/manage/:tournamentId
```

**Access:** Protected, Tournament Owner Organizer/Admin/SuperAdmin

## Delete Tournament

```http
DELETE /api/tournaments/manage/:tournamentId
```

**Access:** Protected, Tournament Owner Organizer/Admin/SuperAdmin

---

# 6. Match Room APIs

Base path:

```text
/api/matchrooms
```

## Create Match Room

```http
POST /api/matchrooms/create/:tournamentId
```

**Access:** Protected, Organizer/Admin/SuperAdmin

### Request Body

```json
{
  "roomId": "123456",
  "roomPassword": "abcd123",
  "map": "Erangel",
  "matchTime": "2026-07-20T10:00:00.000Z"
}
```

## Get All Match Rooms

```http
GET /api/matchrooms
```

**Access:** Public

Returns public match room details. Room password is hidden from unauthorized users.

## Get Eligible Match Rooms

```http
GET /api/matchrooms/eligible
```

**Access:** Protected

Returns match rooms where the user's team is registered and eligible to view room password.

## Get My Created Match Rooms

```http
GET /api/matchrooms/my-created
```

**Access:** Protected, Organizer/Admin/SuperAdmin

## Get Match Room By ID

```http
GET /api/matchrooms/:matchRoomId
```

**Access:** Public

## Update Match Room

```http
PATCH /api/matchrooms/manage/:matchRoomId
```

**Access:** Protected, Room Owner Organizer/Admin/SuperAdmin

## Delete Match Room

```http
DELETE /api/matchrooms/manage/:matchRoomId
```

**Access:** Protected, Room Owner Organizer/Admin/SuperAdmin

---

# 7. Result Submission APIs

Base path:

```text
/api/result-submissions
```

## Submit Result

```http
POST /api/result-submissions/submit
```

**Access:** Protected

### Request Body

```json
{
  "tournamentId": "tournament_id_here",
  "matchRoomId": "match_room_id_here",
  "teamId": "team_id_here",
  "position": 1,
  "kills": 12,
  "screenshotUrl": "https://example.com/result.png"
}
```

## Get My Submissions

```http
GET /api/result-submissions/my-submissions
```

**Access:** Protected

## Get Pending Result Submissions

```http
GET /api/result-submissions/pending
```

**Access:** Protected, Organizer/Admin/SuperAdmin

Organizer sees pending submissions for their own tournaments. Admin/SuperAdmin can view all pending submissions.

## Approve Submission

```http
PATCH /api/result-submissions/approve/:submissionId
```

**Access:** Protected, Organizer/Admin/SuperAdmin

## Reject Submission

```http
PATCH /api/result-submissions/reject/:submissionId
```

**Access:** Protected, Organizer/Admin/SuperAdmin

### Request Body

```json
{
  "adminNote": "Screenshot is unclear"
}
```

---

# 8. Organizer Request APIs

Base path:

```text
/api/organizer-requests
```

## Apply For Organizer

```http
POST /api/organizer-requests/request
```

**Access:** Protected, Player

### Request Body

```json
{
  "reason": "I want to host BGMI tournaments for college players.",
  "experience": "Managed local gaming events.",
  "contactInfo": "yash@example.com"
}
```

## Get My Organizer Requests

```http
GET /api/organizer-requests/my-requests
```

**Access:** Protected

## Get Pending Organizer Requests

```http
GET /api/organizer-requests/pending
```

**Access:** Protected, Admin/SuperAdmin

## Approve Organizer Request

```http
PATCH /api/organizer-requests/approve/:requestId
```

**Access:** Protected, Admin/SuperAdmin

### Request Body

```json
{
  "adminNote": "Approved"
}
```

## Reject Organizer Request

```http
PATCH /api/organizer-requests/reject/:requestId
```

**Access:** Protected, Admin/SuperAdmin

### Request Body

```json
{
  "adminNote": "Insufficient details"
}
```

---

# 9. Admin APIs

Base path:

```text
/api/admin
```

## Get Admin Dashboard Stats

```http
GET /api/admin/dashboard
```

**Access:** Protected, Admin/SuperAdmin

## Get Users

```http
GET /api/admin/users
```

**Access:** Protected, Admin/SuperAdmin

## Delete User

```http
DELETE /api/admin/users/:userId
```

**Access:** Protected, Admin/SuperAdmin

Rules:
- Admin cannot delete themselves.
- Admin cannot delete SuperAdmin.
- Only SuperAdmin can delete Admin users.

## Get Teams

```http
GET /api/admin/teams
```

**Access:** Protected, Admin/SuperAdmin

## Delete Team

```http
DELETE /api/admin/teams/:teamId
```

**Access:** Protected, Admin/SuperAdmin

---

# 10. Notification APIs

Base path:

```text
/api/notifications
```

## Get My Notifications

```http
GET /api/notifications
```

**Access:** Protected

## Mark Notification As Read

```http
PATCH /api/notifications/:notificationId/read
```

**Access:** Protected

---

# 11. Leaderboard APIs

Base path:

```text
/api/leaderboard
```

## Get Leaderboard

```http
GET /api/leaderboard
```

**Access:** Public

Returns team or tournament leaderboard based on approved match results.

---

# 12. Winner APIs

Base path:

```text
/api/winner
```

## Get Winners

```http
GET /api/winner
```

**Access:** Public

Returns winners based on completed tournaments or approved results.

---

# 13. Prize APIs

Base path:

```text
/api/prizes
```

## Get Prize Distributions

```http
GET /api/prizes
```

**Access:** Public / Protected depending on implementation

## Create Prize Distribution

```http
POST /api/prizes
```

**Access:** Protected, Organizer/Admin/SuperAdmin

---

# 14. Match Registration APIs

Base path:

```text
/api/matchregistrations
```

## Register For Match

```http
POST /api/matchregistrations
```

**Access:** Protected

## Get Match Registrations

```http
GET /api/matchregistrations
```

**Access:** Protected

---

# 15. Match Result APIs

Base path:

```text
/api/matchresults
```

## Get Match Results

```http
GET /api/matchresults
```

**Access:** Public

## Create Match Result

```http
POST /api/matchresults
```

**Access:** Protected, Organizer/Admin/SuperAdmin

---

# Common Error Responses

## Unauthorized

```json
{
  "message": "Not authorized, token failed"
}
```

## Forbidden

```json
{
  "message": "Access Denied"
}
```

## Validation Error

```json
{
  "message": "Invalid MongoDB ObjectId"
}
```

## Not Found

```json
{
  "message": "Route not found"
}
```

## Server Error

```json
{
  "message": "Internal Server Error"
}
```

---

# Deployment URLs

## Frontend

```text
https://esports-battle-coral.vercel.app
```

## Backend API

```text
https://esports-battle-api.onrender.com
```

---

# Notes

- Render free instance may sleep after inactivity. First API request can take 40-60 seconds.
- Room passwords are not publicly visible. They are shown only to eligible registered teams or authorized managers.
- Public signup creates only `player` accounts.
- Organizer role is granted through admin approval.
- Admin/SuperAdmin accounts should be created securely, not through public signup.
