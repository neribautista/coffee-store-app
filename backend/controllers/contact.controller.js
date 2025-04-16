import Contact from "../models/contact.model.js";
import mongoose from "mongoose";

// Contact Controllers
 export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({}); // find all contacts in the database
        res.status(200).json({ success: true, data: contacts }); // 200 means success
    } catch (error) {
        console.log("Error fetching contacts:", error);
        res.status(500).json({ success: false, message: "Server error" }); // 500 means server error
    }
 };

 export const createContact = async (req, res) => {
    const contact = req.body; // user will send this data

    if (!contact.name || !contact.email || !contact.subject || !contact.message) {
        return res.status(400).json({ message: "Missing required fields: name, email, subject, message" });
    }

    const newContact = new Contact(contact);

    try {
        await newContact.save(); // save the contact to the database
        res.status(201).json({ success: true, data: newContact }); // 201 means created successfully
    } catch (error) {
        console.error("Error saving contact:", error);
        res.status(500).json({ success: false, message: "Server error" }); // 500 means server error
    }
 };


