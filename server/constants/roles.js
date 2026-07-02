const ROLES = {
  PLAYER: "player",
  ORGANIZER: "organizer",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
};

const USER_ROLES = [
  ROLES.PLAYER,
  ROLES.ORGANIZER,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

module.exports = {
  ROLES,
  USER_ROLES,
};
