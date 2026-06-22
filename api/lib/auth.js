import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "smart-agri-secret-key-1357";

export function authenticate(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token is missing" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    res.status(403).json({ error: "Expired or invalid token" });
    return null;
  }
}

export function requireAdmin(user, res) {
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Administrator rights required" });
    return false;
  }
  return true;
}
