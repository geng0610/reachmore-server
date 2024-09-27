"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const requirementDocumentRoutes_1 = __importDefault(require("./routes/api/requirementDocumentRoutes"));
const requirementRoutes_1 = __importDefault(require("./routes/api/requirementRoutes"));
const approvalStateRoutes_1 = __importDefault(require("./routes/api/approvalStateRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/api/vendorRoutes"));
const vendorResponseRoutes_1 = __importDefault(require("./routes/api/vendorResponseRoutes"));
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const requireUser = require('./middlewares/requireUser');
const morgan_1 = __importDefault(require("morgan")); // Import morgan for logging
// Load environment variables
require('dotenv').config();
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
if (!clerkSecretKey || !clerkPublishableKey) {
    throw new Error("Clerk secret or publishable key is not defined. Please set the CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY environment variables.");
}
// Initialize Clerk
app.use(ClerkExpressWithAuth({
    apiKey: clerkSecretKey,
}));
(0, db_1.default)(); // Connect to MongoDB
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json()); // Middleware to parse JSON requests
app.use((0, morgan_1.default)('dev')); // Add morgan for request logging
// Define routes
app.use('/api/requirement-documents', requireUser, requirementDocumentRoutes_1.default);
app.use('/api/requirements', requirementRoutes_1.default);
app.use('/api/approval-states', approvalStateRoutes_1.default);
app.use('/api/vendors', vendorRoutes_1.default);
app.use('/api/vendor-responses', vendorResponseRoutes_1.default);
// Error handling middleware with explicit types
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
