import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helper/sendVerificationEmail";



export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });
        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken.",
            },{status:400})
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({email});

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserVerifiedByEmail) {

            if(existingUserVerifiedByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "Email is already registered.",
                },{status:400})
            }else{
                const hashedassword = await bcrypt.hash(password, 10);
                existingUserVerifiedByEmail.password = hashedassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
                await existingUserVerifiedByEmail.save();
            }
        }else{
            const hashedassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); 

            const newUser = new UserModel({
                username,
                email,
                password: hashedassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAccesptingMessages: true,
                messages: [],
            })

            await newUser.save();
        }


        // Send verification email

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: "Failed to send verification email.",
            },{status:500})
        }

        return Response.json({
            success: true,
            message: "Verification email sent. Please check your inbox.",
        },{status:201})

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