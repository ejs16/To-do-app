import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextRouter } from "next/router";
import User from "@/models/User";
import dbConnect from "./dbConnect";
import bcrypt from 'bcrypt';

interface IUser {
  _id: any;
  name: string;
  email: string;
  password: string;
}


export const authOptions: NextAuthOptions = {
  // Secret for Next-auth, without this JWT encryption/decryption won't work
  secret: process.env.NEXTAUTH_SECRET,

  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        await dbConnect();
        const hashedPassword = credentials?.password ? await bcrypt.hash(credentials.password, 10) : undefined;
      
        const userRecord = await User.findOne({ email: credentials?.username }) as IUser;
      
        if (userRecord && credentials?.password) {
          const isPasswordMatch = await bcrypt.compare(credentials.password, userRecord.password);
          if (isPasswordMatch) {
            const user = { id: userRecord._id.toString(), name: userRecord.name, email: userRecord.email };
            return Promise.resolve(user);
          }
        }
        return Promise.resolve(null);
      }
    })
  ],
  callbacks: {
    async session({session}) {
      // session and user parameters are passed by NextAuth
      await dbConnect();
      
      // Assume you have a Users collection in your database
      const userProps = await User.findOne({ email: session?.user?.email }) as IUser;
  
      // Add a new custom property to the session object
      if (userProps) {
        session.userId = userProps._id.toString();
      }
  
      return session;
    }
  },
};