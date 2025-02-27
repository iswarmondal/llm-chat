import admin from "firebase-admin";
import { type Request, type Response, type NextFunction } from "express";

export function verifyFirebaseAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized: Missing auth token");
  }

  const token = authHeader.split(" ")[1];
  admin
    .auth()
    .verifyIdToken(token)
    .then(() => {
      next();
    })
    .catch((error) => {
      console.error("Error verifying token:", error.message);
      res.status(401).send("Unauthorized: Invalid auth token");
    });
}
