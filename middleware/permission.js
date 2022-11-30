function canViewUser(user, id) {
  return user.role == 3 || user.id == id;
}

module.exports = { canViewUser };
