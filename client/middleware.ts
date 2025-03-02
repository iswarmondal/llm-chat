import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as jose from "jose";

interface JwtPayload extends jose.JWTPayload {
  user_id: string;
  exp: number;
  iat: number;
  aud: string;
  iss: string;
  sub: string;
  auth_time: number;
}

interface JwtHeader {
  kid: string;
}

export default async function middleware(request: NextRequest) {
  console.log("middleware");
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.split(" ")[1];

    // This is the list of public keys for the Firebase project
    const response = await fetch(
      `https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`
    );
    const certs = await response.json();

    // Verify the token using the public keys
    const decodedToken = await verifyFirebaseToken(token, certs);
    if (!decodedToken || !decodedToken.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

async function verifyFirebaseToken(
  token: string,
  publicKeys: Record<string, string>
) {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const header = JSON.parse(atob(tokenParts[0])) as JwtHeader;
    const kid = header.kid;
    const publicKey = publicKeys[kid];

    if (!publicKey) {
      throw new Error("Public key not found");
    }

    const key = await jose.importX509(publicKey, "RS256");
    const { payload } = (await jose.jwtVerify(token, key, {
      issuer: `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
      audience: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      maxTokenAge: 60 * 60 * 24 * 30, // 30 days
      algorithms: ["RS256"],
    })) as { payload: JwtPayload };

    if (!payload) {
      throw new Error("Invalid token");
    }

    // Verify expiration
    // Must be a non-negative integer and must be greater than the current time.
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("Token has expired");
    }

    // Verify issued time
    // Must be a non-negative integer and must be less than or equal to the current time.
    if (payload.iat && payload.iat >= now) {
      throw new Error("Token has been issued in the future");
    }

    // Verify audience
    // Must be a non-empty string and must be the same as the audience of the token.
    if (payload.aud !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error("Invalid audience");
    }

    // Verify issuer
    // Must be a non-empty string and must be the same as the issuer of the token.
    if (
      payload.iss !==
      `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`
    ) {
      throw new Error("Invalid issuer");
    }

    // Verify subject
    // Must be a non-empty string and must be the uid of the user or device.
    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      throw new Error("Invalid subject");
    }

    // Verify auth time
    // Must be in the past. The time when the user authenticated.
    if (payload.auth_time && payload.auth_time > now) {
      throw new Error("Token has been issued in the future");
    }
    return payload as JwtPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
}

export const config = {
  matcher: "/api/:path*",
  runtime: "nodejs",
};
