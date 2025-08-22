import argon2 from "argon2";

// Hashing password
async function HashPassword(password) {
  var hash;
  try {
    hash = await argon2.hash(password);
  } catch (err) {
    console.error("Error hashing password:", err);
  }
  return hash;
}

// Verifying password
async function VerifyPassword(hash, password) {
  try {
    if (await argon2.verify(hash, password)) {
      // console.log("Password is valid!");
      return true;
    } else {
      // console.log("Invalid password.");
        return false;
    }
  } catch (err) {
    console.error("Error verifying password:", err);
  }
}

export { HashPassword, VerifyPassword };