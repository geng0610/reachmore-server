"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/api/approvalStateRoutes.ts
const express_1 = __importDefault(require("express"));
const approvalState_1 = __importDefault(require("../../models/approvalState")); // Adjusted import path
const router = express_1.default.Router();
// Create a new approval state
router.post('/', async (req, res) => {
    try {
        const newState = new approvalState_1.default(req.body);
        const savedState = await newState.save();
        res.status(201).json(savedState);
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
// Get all approval states
router.get('/', async (req, res) => {
    try {
        const states = await approvalState_1.default.find();
        res.json(states);
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
// Update an approval state
router.put('/:id', async (req, res) => {
    try {
        const updatedState = await approvalState_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedState) {
            return res.status(404).json({ message: 'Approval state not found' });
        }
        res.json(updatedState);
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
// Delete an approval state
router.delete('/:id', async (req, res) => {
    try {
        const deletedState = await approvalState_1.default.findByIdAndDelete(req.params.id);
        if (!deletedState) {
            return res.status(404).json({ message: 'Approval state not found' });
        }
        res.json({ message: 'Approval state deleted successfully' });
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
