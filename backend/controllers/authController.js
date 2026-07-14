const e = require("express");
const User = require("../models/products");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail.js");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body; 
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = await User.create({ name, email, password: hashedPassword });
        if(user) {
            const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

            const message = `Your OTP for Cartify registration is: ${otp}. Please use this to verify your email.`;
            await sendEmail(email, "Cartify Registration OTP", message);
            res.status(201).json(
                _id = user._id,
                name = user.name,
                email = user.email,
                role = user.role,
                token = generateToken(user._id)
            );
        }
        else {
            res.status(400).json({ message: "Invalid user data" });
        }
        
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ 
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error logging in user" });
    }   
};

