const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../models/document");

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = "uploads/";
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Unique filename: timestamp + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/upload-document:
 *   post:
 *     summary: Upload a document for a project
 *     tags: [Document]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *               category:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
router.post("/upload-document", upload.single("file"), async (req, res) => {
    try {
        const { projectId, category, customName } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ status: false, message: "No file uploaded" });
        }

        if (!projectId) {
            return res.status(400).json({ status: false, message: "Project ID is required" });
        }

        // Create document record
        const newDocument = await Document.create({
            projectId,
            category,
            customName: customName || file.originalname,
            fileUrl: file.path.replace(/\\/g, "/"), // Store standardized path
            fileName: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size
        });

        res.json({
            status: true,
            message: "Document uploaded successfully",
            document: newDocument
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ status: false, message: "Error uploading document", error: error.message });
    }
});

/**
 * @swagger
 * /api/documents/{projectId}:
 *   get:
 *     summary: Get all documents for a project
 *     tags: [Document]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get("/documents/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const documents = await Document.find({ projectId }).sort({ uploadDate: -1 });

        res.json({
            status: true,
            documents
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Error fetching documents", error: error.message });
    }
});

/**
 * @swagger
 * /api/delete-document/{documentId}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Document]
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
router.delete("/delete-document/:documentId", async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ status: false, message: "Document not found" });
        }

        // Delete file from filesystem
        const filePath = document.fileUrl;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete record from DB
        await Document.findByIdAndDelete(documentId);

        res.json({
            status: true,
            message: "Document deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Error deleting document", error: error.message });
    }
});

module.exports = router;
