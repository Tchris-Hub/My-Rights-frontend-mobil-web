import { prisma } from '../db';
import { HttpError } from '../authz';

const PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  image: true,
  phone_number: true,
  is_active: true,
  emailVerified: true,
  is_superuser: true,
  createdAt: true,
} as const;

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PROFILE_SELECT });
  if (!user) throw new HttpError(404, 'Profile not found.');
  return user;
}

export async function updateProfile(
  userId: string,
  input: { name?: string; phone_number?: string },
) {
  const data: { name?: string; phone_number?: string } = {};
  if (typeof input.name === 'string') data.name = input.name.trim().slice(0, 200);
  if (typeof input.phone_number === 'string') data.phone_number = input.phone_number.trim().slice(0, 50);

  return prisma.user.update({ where: { id: userId }, data, select: PROFILE_SELECT });
}
