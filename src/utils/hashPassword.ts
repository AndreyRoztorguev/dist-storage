import bcrypt from "bcrypt";

async function hashPassword(password: string) {
  return await bcrypt.hash(password, +process.env.BCRYPT_SOLT!);
}

export { hashPassword };
