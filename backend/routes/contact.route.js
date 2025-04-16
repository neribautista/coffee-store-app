import express from 'express';
import { createContact, getContacts } from '../controllers/contact.controller.js'; 
import e from 'express';

const router = express.Router();

//Contact Routes

router.get('/', getContacts);
router.post('/', createContact);

export default router;