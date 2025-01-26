import { ObjectId } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { CustomResponse } from "@/types";
import { hashText } from "@/utils/bcrypt";

export type UserModel = {
  _id: ObjectId;
  email: string;
  name: string;
  password: string;
  tickets?: ObjectId[];
};

export type UserModelWithoutPassword = Omit<UserModel, "password">;

export const createUser = async (email: string, name: string, password: string): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection("User");

  const modifiedUser = {
    email,
    name,
    password: hashText(password),
  };

  const insertedUser = await collection.insertOne(modifiedUser);

  const result: UserModelWithoutPassword = {
    _id: insertedUser.insertedId,
    email,
    name,
    tickets: [],
  };

  return {
    statusCode: 201,
    data: result,
  };
};

export const getAllUsers = async (): Promise<CustomResponse<UserModel[]>> => {
  const db = await getDb();
  const collection = db.collection("User");

  const users = (await collection.find({}).toArray()) as UserModel[];

  const result: CustomResponse<UserModel[]> = {
    statusCode: 200,
    data: users,
  };

  return result;
};

export const getUserByEmail = async (email: string): Promise<CustomResponse<UserModel>> => {
  const db = await getDb();
  const collection = db.collection("User");

  const user = (await collection.findOne({ email })) as UserModel;

  console.log(user, "find email user");

  const result: CustomResponse<UserModel> = {
    statusCode: 200,
    data: user,
  };

  return result;
};
