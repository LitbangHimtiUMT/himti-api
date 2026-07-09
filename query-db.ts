import { prisma } from "./src/config";

async function main() {
  const moduleId = "d172fd4f-23df-4711-9c7a-5b2ae8b2f64d";
  console.log("Fetching module info for:", moduleId);
  
  const modules = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      session: {
        include: {
          class: {
            include: {
              ClassMentor: {
                include: {
                  user: true
                }
              },
              user: true
            }
          }
        }
      }
    }
  });

  if (!modules) {
    console.log("❌ Module not found!");
    return;
  }

  console.log("✅ Module found:", modules.name);
  console.log("Session:", modules.session.name);
  console.log("Class:", modules.session.class.name);
  console.log("Class CreatedBy:", modules.session.class.createdBy);
  console.log("Class Creator User:", modules.session.class.user.name, `(${modules.session.class.user.id})`);
  
  console.log("\nClass Mentors:");
  modules.session.class.ClassMentor.forEach((cm, i) => {
    console.log(`   ${i + 1}. User ID: ${cm.userId}, Name: ${cm.user.name}, Role: ${cm.user.role}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
