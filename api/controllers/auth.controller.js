import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {

        // Hash the password

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(hashedPassword);

        // Create a new user and save to DB
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        console.log(newUser);

        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to create user" });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {

        // check if the user exists

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) return res.status(401).json({ message: 'invalid credentials' });

        // check if password is correct

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return res.status(401).json({ message: 'invalid credentials' });

        // generate cookie token and send to the user

        // res.setHeader("Set-Cookie", "test=" + "myValue").json("successfully");

        console.log('rocess.env.JWT_SECRET_KEY', process.env.JWT_SECRET_KEY);

        const age = 1000 * 60 * 60 * 24 * 7;

        const token = jwt.sign({
            id: user.id
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: age
        });

        res.cookie("token", token, {
            httpOnly: true,
            // secure: true,
            maxAge: age,
        }).status(200).json({ message: "Login Successfully" });

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: "Failed to login" });
    }
};

export const logout = (req, res) => {

};