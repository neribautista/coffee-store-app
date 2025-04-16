import User from "../models/user.model.js";
import mongoose from "mongoose";

// User Controllers
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}); // find all users in the database
        res.status(200).json({ success: true, data: users }); // 200 means success
    } catch (error) {
        console.log("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Server error" }); // 500 means server error
    }
};

export const createUser = async (req, res) => {
    const user = req.body; // user will send this data

    if (!user.first_name || !user.last_name || !user.email || !user.password) {
        return res.status(400).json({ message: "Missing required fields: name, email, password" });
    }

    const newUser = new User(user);

    try {
        await newUser.save(); // save the user to the database
        res.status(201).json({ success: true, data: newUser }); // 201 means created successfully
    } catch (error) {
        console.error("Error saving user:", error);

        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        res.status(500).json({ success: false, message: "Server error" }); // 500 means server error
    }
}
