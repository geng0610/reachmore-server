"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requirementDocument_1 = __importDefault(require("../../models/requirementDocument"));
const requirement_1 = __importDefault(require("../../models/requirement"));
const requireUser = require('../../middlewares/requireUser');
const router = express_1.default.Router();
// Create a new requirement document
router.post('/', requireUser, async (req, res) => {
    try {
        const organizationId = req.auth?.orgId; // Safely get the organization ID from the request
        const newDocument = new requirementDocument_1.default({
            ...req.body,
            company_id: organizationId, // Set the organization ID
        });
        const savedDocument = await newDocument.save();
        res.status(201).json(savedDocument);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error saving document:', error.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
// Get all active requirement documents for the organization (exclude soft-deleted ones)
router.get('/', requireUser, async (req, res) => {
    try {
        const organizationId = req.auth?.orgId; // Safely get the organization ID from the request
        const documents = await requirementDocument_1.default.find({ deleted: false, company_id: organizationId }); // Filter by organization ID and exclude deleted documents
        res.json(documents);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching documents:', error.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
// Typeahead search endpoint
router.get('/typeahead-search', requireUser, async (req, res) => {
    try {
        const organizationId = req.auth?.orgId; // Safely get the organization ID from the request
        const searchTerm = req.query.q; // Extract search term from query parameter
        const documents = await requirementDocument_1.default.find({
            document_name: { $regex: searchTerm, $options: 'i' }, // Case-insensitive search
            deleted: false, // Ensure we are not returning deleted documents
            company_id: organizationId, // Filter by organization ID
        }).select('document_name _id'); // Return only document_name and _id fields
        res.json(documents);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error searching documents', error: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
// Get a single requirement document by ID, only if it is not deleted and belongs to the organization
router.get('/:id', requireUser, async (req, res) => {
    try {
        const organizationId = req.auth?.orgId; // Safely get the organization ID from the request
        const document = await requirementDocument_1.default.findOne({
            _id: req.params.id,
            deleted: false,
            company_id: organizationId // Ensure the document belongs to the organization
        });
        if (!document) {
            return res.status(404).json({ message: 'Requirement document not found' });
        }
        res.json(document);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching document:', error.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
// Update a requirement document, only if it is not deleted and belongs to the organization
router.put('/:id', requireUser, async (req, res) => {
    try {
        const organizationId = req.auth?.orgId; // Safely get the organization ID from the request
        // Find the document and ensure it is not deleted and belongs to the organization before updating
        const document = await requirementDocument_1.default.findOne({
            _id: req.params.id,
            deleted: false,
            company_id: organizationId // Ensure the document belongs to the organization
        });
        if (!document) {
            return res.status(404).json({ message: 'Requirement document not found or has been deleted' });
        }
        // Perform the update
        const updatedDocument = await requirementDocument_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true } // This option returns the updated document
        );
        res.json(updatedDocument);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error updating document:', error.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
// Soft delete a requirement document and mark associated requirements as deleted, only if it belongs to the organization
router.delete('/:id', requireUser, async (req, res) => {
    try {
        const organizationId = req.auth?.orgId; // Safely get the organization ID from the request
        // Soft delete the requirement document by setting 'deleted' to true, ensuring it belongs to the organization
        const deletedDocument = await requirementDocument_1.default.findOneAndUpdate({ _id: req.params.id, company_id: organizationId }, // Ensure the document belongs to the organization
        { deleted: true }, { new: true });
        if (!deletedDocument) {
            return res.status(404).json({ message: 'Requirement document not found' });
        }
        // Also soft delete all requirements associated with this document
        await requirement_1.default.updateMany({ document_id: req.params.id }, { deleted: true });
        res.json({ message: 'Requirement document and associated requirements marked as deleted successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error deleting document:', error.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
exports.default = router;
