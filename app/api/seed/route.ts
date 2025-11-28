import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/seed - Create admin user (only use once, then delete this file)
export async function POST() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {
        password: hashedPassword,
      },
      create: {
        email: "admin@example.com",
        name: "Admin",
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Admin user created",
      email: admin.email,
      password: "admin123",
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
