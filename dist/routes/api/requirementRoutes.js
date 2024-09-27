"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/api/requirementRoutes.ts
const express_1 = __importDefault(require("express"));
const requirement_1 = __importDefault(require("../../models/requirement")); // Adjusted import path
const router = express_1.default.Router();
// Create a new requirement with auto-generated label
router.post('/', async (req, res) => {
    try {
        // Find all requirements (including soft-deleted ones) to count for label generation
        const requirementsCount = await requirement_1.default.countDocuments({ document_id: req.body.document_id });
        // Generate label using the convention "R-<numerical designation>"
        const label = `R-${requirementsCount + 1}`;
        // Create the new requirement with the generated label
        const newRequirement = new requirement_1.default({
            ...req.body,
            label, // Assign the generated label
        });
        const savedRequirement = await newRequirement.save();
        res.status(201).json(savedRequirement);
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
// Get all active requirements (exclude soft-deleted ones)
router.get('/', async (req, res) => {
    try {
        const requirements = await requirement_1.default.find({ deleted: false });
        res.json(requirements);
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
// Get a single requirement by ID, only if it is not deleted
router.get('/:id', async (req, res) => {
    try {
        const requirement = await requirement_1.default.findOne({ _id: req.params.id, deleted: false });
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found' });
        }
        res.json(requirement);
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
// Update a requirement, only if it is not deleted
router.put('/:id', async (req, res) => {
    try {
        const requirement = await requirement_1.default.findOne({ _id: req.params.id, deleted: false });
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found or has been deleted' });
        }
        const updatedRequirement = await requirement_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRequirement);
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
// Soft delete a requirement
router.delete('/:id', async (req, res) => {
    try {
        const deletedRequirement = await requirement_1.default.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        if (!deletedRequirement) {
            return res.status(404).json({ message: 'Requirement not found' });
        }
        res.json({ message: 'Requirement marked as deleted successfully' });
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
