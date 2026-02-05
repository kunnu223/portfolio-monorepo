import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/lib/models/Portfolio";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  personalInfo,
  experiences,
  skills,
  projects,
  education,
} from "@/lib/data";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_12345",
);

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  await dbConnect();
  try {
    let data = await Portfolio.findOne().lean();

    if (!data) {
      // Initialize with default data if DB is empty
      const defaultData = {
        personalInfo: { ...personalInfo, about: "", profileImage: "" },
        experiences,
        skills,
        projects,
        education,
        resumeUrl: "/resume.pdf",
      };
      data = await Portfolio.create(defaultData);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    // We only keep one portfolio document for this simple app
    const data = await Portfolio.findOneAndUpdate({}, body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
