import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userSeed = [
  {
    discordId: '463823197356294156',
    userName: ' Caleb M',
  },
  {
    discordId: '628079232819658752',
    userName: ' Scott2bReal',
  },
  {
    discordId: '1060014844008480828',
    userName: ' Keith B',
  },
  {
    discordId: '1059893151273341019',
    userName: ' ryangac',
  },
]

async function main() {
  for(const user of userSeed) {
    await prisma.user.create({
      data: user,
    })
  }
  // for (const climber of realClimberSeed) {
  //   await prisma.climber.create({
  //     data: climber,
  //   })
  // }
  // for (const climbingClass of climbingClassSeed) {
  //   await prisma.climbingClass.create({
  //     data: climbingClass,
  //   })
  // }
}

main().catch(e => {
  console.log(e);
  process.exit(1);
}).finally(() => {
    prisma.$disconnect()
  })
