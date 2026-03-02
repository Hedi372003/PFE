require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../../src/config/prisma");
const robotsData = require("./test-robots");

async function seedRobots() {
  const robots = [];

  for (const robot of robotsData) {
    const upserted = await prisma.robot.upsert({
      where: { robotId: robot.robotId },
      update: {
        name: robot.name,
        latitude: robot.latitude,
        longitude: robot.longitude,
        status: robot.status,
      },
      create: robot,
    });

    robots.push(upserted);
  }

  return robots;
}

async function seedAdmin(defaultRobotId) {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@telebot.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      firstName: "System",
      lastName: "Admin",
      phone: "+0000000000",
      role: "admin",
      password: passwordHash,
      robotId: defaultRobotId || null,
      isActive: true,
    },
    create: {
      firstName: "System",
      lastName: "Admin",
      email: adminEmail.toLowerCase(),
      phone: "+0000000000",
      password: passwordHash,
      role: "admin",
      robotId: defaultRobotId || null,
      isActive: true,
    },
  });

  return { admin, adminEmail, adminPassword };
}

async function main() {
  const robots = await seedRobots();
  const { admin, adminEmail, adminPassword } = await seedAdmin(robots[0]?.id);

  console.log("Seed finished.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`Robots seeded: ${robots.length}`);
  console.log(`Admin role: ${admin.role}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
