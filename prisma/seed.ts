import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userSeed = [
  // {
  //   id: '463823197356294156',
  //   userName: ' Caleb M',
  // },
  // {
  //   id: '628079232819658752',
  //   userName: ' Scott2bReal',
  // },
  // {
  //   id: '1060014844008480828',
  //   userName: ' Keith B',
  // },
  // {
  //   id: '1059893151273341019',
  //   userName: ' ryangac',
  // },
]

async function main() {
  // for(const user of userSeed) {
  //   await prisma.user.create({
  //     data: user,
  //   })
  // }
}

main().catch(e => {
  console.log(e);
  process.exit(1);
}).finally(() => {
    prisma.$disconnect()
  })
