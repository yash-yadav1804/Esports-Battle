# Esports Battle

Esports Battle is a full-stack MERN esports tournament management platform where players can create teams, register for tournaments, view match rooms, submit match results, and track leaderboards. Admins can manage users, teams, tournaments, match rooms, result approvals, dashboard statistics, and completed tournament history.

---

## Project Overview

This project is built to manage esports tournaments like BGMI, PUBG, and Free Fire. It includes a complete player flow and admin control panel.

Players can join teams and participate in tournaments. Admins can create tournaments, create match rooms, approve results, manage platform data, and complete tournaments with automatic winner and prize distribution flow.

---

## Features

### Player Features

- Register and login
- JWT-based authentication
- Create team
- View all teams
- Send team join request
- Approve or reject team requests as IGL
- Register team in tournaments
- Leave tournament before it starts
- View match rooms
- Submit match result
- View personal result submissions
- View notifications
- View leaderboard
- View completed tournament history

### Admin Features

- Admin dashboard with platform statistics
- Manage users
- Manage teams
- Create tournaments
- Update tournaments
- Delete tournaments
- Start tournaments
- Complete tournaments
- Create match rooms
- Review pending result submissions
- Approve submitted results
- Reject submitted results with admin note
- View prize distribution
- View completed tournament history

---

## Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- CSS Modules

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt.js

---

## Project Structure

```text
Esports-Battle
├── client
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── pages
│   │   ├── routes
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── docs
│   └── API_DOCUMENTATION.md
│
└── README.md
```
