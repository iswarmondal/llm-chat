import admin from "firebase-admin";
import { type Request, type Response, type NextFunction } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";

export interface CustomRequest extends Request {
  decodedToken?: DecodedIdToken;
}

export function verifyFirebaseAuth(
  req: CustomRequest,
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
    .then((decodedToken) => {
      req.decodedToken = decodedToken;
      next();
    })
    .catch((error) => {
      console.error("Error verifying token:", error.message);
      res.status(401).send("Unauthorized: Invalid auth token");
    });
}
