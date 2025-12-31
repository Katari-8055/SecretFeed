import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helper/sendVerificationEmail";



export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();
    } catch (error) {
        console.error("Error in sign-up route:", error);
        return Response.json({
            success: false,
            message: "Internal server error.",
        },
            { status: 500 }
        )
    }
}