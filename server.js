const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const cors = require("cors"); // Enable cross-origin requests
require("dotenv").config();
const xlsx = require("xlsx"); // Add this to handle XLSX files
const fs = require("fs"); // To delete temporary files after processing

const app = express();
const upload = multer({ dest: "uploads/" }); // File upload destination

// Enable CORS to allow requests from your React app
app.use(cors());

// Initialize Google Generative AI API
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
console.log(genAI, fileManager, "API Keys");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const convertXlsxToPlainText = (filePath) => {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);

    // Get the first sheet name
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("No sheets found in the Excel file.");
    }

    // Get the first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON array with headers as row keys
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // If the sheet is empty, return an empty string
    if (!jsonData.length) {
      return "";
    }

    // Convert JSON data into plain text
    const plainText = jsonData
      .map((row) => row.join("\t")) // Join cells of each row with tabs
      .join("\n"); // Join rows with newlines

    return plainText;
  } catch (error) {
    throw new Error("Error extracting text from Excel: " + error.message);
  }
};

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    

    let mimeType = file.mimetype;
    let plainTextData = null;
    let tempFilePath = file.path;

    // Handle Excel files: Convert to plain text
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      console.log("Processing Excel file...");
      plainTextData = convertXlsxToPlainText(file.path);
      mimeType = "text/plain"; 

      tempFilePath = "uploads/temporary.txt";
      fs.writeFileSync(tempFilePath, plainTextData);
      if (!plainTextData) {
        throw new Error("Failed to extract data from the Excel file.");
      }
    }

    const fileManagerObj = {
      name: file.filename,
      displayName: file.originalname,
      mimeType: mimeType,
    };

    // Upload file to Google AI FileManager
    let uploadResponse;
      // Direct upload for other supported formats
      uploadResponse = await fileManager.uploadFile(tempFilePath, fileManagerObj);

    if (!uploadResponse || !uploadResponse.file || !uploadResponse.file.uri) {
      throw new Error("Failed to upload file to Google AI FileManager.");
    }

    console.log(uploadResponse, "Upload response");

    // Generate content request for processing files
    const generateContentRequest = [];

    // File data: Add uploaded file details
    generateContentRequest.push({
      fileData: {
        mimeType: mimeType,
        fileUri: uploadResponse.file.uri,
      },
    });

      // For PDF and image files: Direct AI processing request
      generateContentRequest.push({
        text: `Please summarize this document as a JSON object with the following fields and send it as an array:
        {
          "SerialNumber": "string",
          "CustomerName": "string",
          "PhoneNumber": "string",
          "ProductName": "string",
          "Quantity": "number",
          "Tax": "number",
          "TotalAmount": "number",
          "Date": "string",
          "AmountPayable": "number",
          "UnitPrice": "number",
          "Email": "string",
          "CompanyName": "string"
        }`,
      });
   
    // Process file using the AI model
    const result = await model.generateContent(generateContentRequest);

    const responseText = result.response.text(); // Raw text response from AI
    console.log(responseText, "Raw AI response");

    // Extract JSON part from response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)```/);
    if (!jsonMatch || !jsonMatch[1]) {
      alert("JSON not found in the AI response.");
    }

    const jsonString = jsonMatch[1]; // Extracted JSON string
    const jsonData = JSON.parse(jsonString); // Parse the JSON string

    res.json(jsonData);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send(error.message);
  } finally {
    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

