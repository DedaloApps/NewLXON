// migrate-old-posts.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateOldPosts() {
  const draftPosts = await prisma.post.findMany({
    where: { status: "DRAFT", scheduledAt: null }
  });

  console.log(`📋 Encontrados ${draftPosts.length} posts sem agendamento`);

  for (const post of draftPosts) {
    const bestTime = post.bestTimeToPost || "09:00";
    const [hours, minutes] = bestTime.split(":").map(Number);

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    scheduledDate.setHours(hours, minutes, 0, 0);

    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: "SCHEDULED",
        scheduledAt: scheduledDate,
      },
    });

    console.log(`✅ Post ${post.id} agendado para ${scheduledDate.toLocaleString("pt-PT")}`);
  }

  console.log("✅ Migração completa!");
}

migrateOldPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });