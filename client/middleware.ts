import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  console.log("middleware");
  const token = request.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const verifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (!verifyResponse.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: "/api/:path*",
};
