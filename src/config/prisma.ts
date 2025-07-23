import { PrismaClient } from '@prisma/client';
import type { User, Call, Summary } from '@prisma/client';

const prisma = new PrismaClient();

export { User, Call, Summary };

export default prisma;
