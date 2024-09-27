"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/api/vendorRoutes.ts
const express_1 = __importDefault(require("express"));
const vendor_1 = __importDefault(require("../../models/vendor")); // Adjusted import path
const router = express_1.default.Router();
// Create a new vendor
router.post('/', async (req, res) => {
    try {
        const newVendor = new vendor_1.default(req.body);
        const savedVendor = await newVendor.save();
        res.status(201).json(savedVendor);
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
// Get all vendors
router.get('/', async (req, res) => {
    try {
        const vendors = await vendor_1.default.find();
        res.json(vendors);
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
// Update a vendor
router.put('/:id', async (req, res) => {
    try {
        const updatedVendor = await vendor_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(updatedVendor);
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
// Delete a vendor
router.delete('/:id', async (req, res) => {
    try {
        const deletedVendor = await vendor_1.default.findByIdAndDelete(req.params.id);
        if (!deletedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json({ message: 'Vendor deleted successfully' });
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
