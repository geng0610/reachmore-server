"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/api/vendorResponseRoutes.ts
const express_1 = __importDefault(require("express"));
const vendorResponse_1 = __importDefault(require("../../models/vendorResponse")); // Adjusted import path
const router = express_1.default.Router();
// Create a new vendor response
router.post('/', async (req, res) => {
    try {
        const newResponse = new vendorResponse_1.default(req.body);
        const savedResponse = await newResponse.save();
        res.status(201).json(savedResponse);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
// Get all vendor responses
router.get('/', async (req, res) => {
    try {
        const responses = await vendorResponse_1.default.find();
        res.json(responses);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
// Update a vendor response
router.put('/:id', async (req, res) => {
    try {
        const updatedResponse = await vendorResponse_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedResponse) {
            return res.status(404).json({ message: 'Vendor response not found' });
        }
        res.json(updatedResponse);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
// Delete a vendor response
router.delete('/:id', async (req, res) => {
    try {
        const deletedResponse = await vendorResponse_1.default.findByIdAndDelete(req.params.id);
        if (!deletedResponse) {
            return res.status(404).json({ message: 'Vendor response not found' });
        }
        res.json({ message: 'Vendor response deleted successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
exports.default = router;
