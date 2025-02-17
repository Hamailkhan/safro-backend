const removeSensitiveFields = (user, fieldsToRemove) => {
  const filteredUser = { ...user };
  fieldsToRemove.forEach((field) => delete filteredUser[field]);
  return filteredUser;
};

module.exports = {
  removeSensitiveFields,
};
