import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Client } from "@gradio/client";

const app = express();
const PORT = 3000;

// Set up multer for file uploads
const upload = multer({ dest: "images/" });

// Gradio API client setup
const GRADIO_API_ENDPOINT = "briaai/BRIA-RMBG-2.0";
const API_NAME = "/image";

// Ensure the __dirname is compatible with ES modules
const __dirname = path.resolve();

app.post("/process-image", upload.single("image"), async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Get the uploaded file path
    const filePath = path.join(__dirname, req.file.path);
    console.log(`Uploaded File Path: ${filePath}`);

    // Read the uploaded file into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Connect to the Gradio client
    const client = await Client.connect(GRADIO_API_ENDPOINT);

    // Send the image to the Gradio API
    const result = await client.predict(API_NAME, {
      image: fileBuffer, // Forwarding the uploaded image
    });

    // Log the API response
    // console.log("Gradio API Response:", result.data);

    // Get the processed file URL (second element from the API response)
    const outputFileUrl = result.data[1].url;

    // Respond with the file URL
    res.status(200).json({
      message: "Image processed successfully.",
      fileUrl: outputFileUrl,
    });

    // Delete the uploaded file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${filePath}`, err);
      } else {
        console.log(`Successfully deleted file: ${filePath}`);
      }
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).send("An error occurred while processing the image.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
