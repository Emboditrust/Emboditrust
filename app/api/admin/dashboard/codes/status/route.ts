import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Code from "@/models/Code";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const active = await Code.countDocuments({ status: "active" });
    const used = await Code.countDocuments({ status: "used" });
    const expired = await Code.countDocuments({ status: "expired" });

    return NextResponse.json({
      success: true,
      data: { active, used, expired }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
