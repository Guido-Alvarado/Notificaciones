import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token faltante" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token inválido" });
    }
}

export function requireAdminOrMod(req, res, next) {
    const rol = req.user.rol_id;
    if (rol === 1 || rol === 2) return next();
    return res.status(403).json({ error: "No tienes permisos para esta acción" });
}
