import bcrypt from "bcryptjs";

export const hashText = (text: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(text, salt);
};

export const compareText = (text: string, hash: string): boolean => {
  return bcrypt.compareSync(text, hash);
};
