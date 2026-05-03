import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Cestooy initial data...");

  // Create admin user if not exists
  const adminEmail = "admin@cestooy.app";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Admin Cestooy",
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log("Admin user created: admin@cestooy.app / admin123");
  } else {
    console.log("Admin user already exists.");
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
