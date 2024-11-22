
AI File Extraction Feature
This project provides an AI-powered file extraction system that allows users to upload Excel files, process them using Google Generative AI, and receive summarized data in JSON format. The server processes the uploaded files, extracts their content, and summarizes the information based on predefined fields like customer name, serial number, product, and more.

Features
Upload an Excel file (XLSX or XLS format).
Extract text data from Excel sheets.
Process the file with Google Generative AI to summarize the document.
Return a JSON object containing the summarized information.
Clean up the uploaded file after processing.
Technologies Used
Node.js: JavaScript runtime environment.
Express: Web framework for building the server.
Multer: Middleware for handling file uploads.
Google Generative AI: API used for generating content based on uploaded files.
xlsx: Library for parsing Excel files.
fs: File system module to handle temporary file creation and deletion.
cors: Middleware for enabling cross-origin requests.
Setup Instructions
Prerequisites
Node.js: Ensure that Node.js is installed. You can download it from here.
Google Cloud API Key: To use the Google Generative AI API, you need to set up a project in Google Cloud and obtain an API key.
Install Dependencies
Clone the repository and navigate to the project folder. Run the following commands to install dependencies:

```bash
git clone <repository-url>
cd <project-folder>
npm install
Set Up Environment Variables
Create a .env file in the root directory of the project and add the following variable:
```

```bash
API_KEY=your-google-cloud-api-key
```

Running the Application
After setting up the environment variables and installing dependencies, you can run the server using the following command:

```bash
npm start
```
This will start the server on the specified port (5001 by default). The server will be accessible at:
```bash
http://localhost:5001
```

API Endpoints
POST /upload
This endpoint allows you to upload an Excel file (XLSX or XLS format) to the server, which will process it and return the extracted data in JSON format.

Request:

Method: POST
Endpoint: /upload
Content-Type: multipart/form-data
Body: The file should be uploaded with the key file.
Example using curl:

```bash
curl -X POST -F "file=@path/to/your/file.xlsx" http://localhost:5001/upload
``` 

Response:

The server will return a JSON object containing the summarized data extracted from the uploaded Excel file.

Example Response:

```bash
[
  {
    "SerialNumber": "12345",
    "CustomerName": "John Doe",
    "PhoneNumber": "123-456-7890",
    "ProductName": "Product A",
    "Quantity": 2,
    "Tax": 5.0,
    "TotalAmount": 105.0,
    "Date": "2024-11-20",
    "AmountPayable": 100.0,
    "UnitPrice": 50.0,
    "Email": "john.doe@example.com",
    "CompanyName": "Company A"
  }
]
```

If the document cannot be processed or the AI does not return a valid response, the server will respond with an error message.

Error Response:

```bash
{
  "error": "Error processing file: <error-details>"
}
```

GET /
This endpoint provides a simple check that the server is running.

Request:

Method: GET
Endpoint: /
Response:

```bash
Express on vercel
```

Handling Errors
In case of any errors during the file processing, the server will return a 500 status code with a message indicating what went wrong. For example:

If no file is uploaded: No file uploaded.
If there is an issue with the AI response: JSON not found in the AI response.
Temporary File Cleanup
Once the file is processed, it will be deleted from the server's filesystem to ensure that temporary files do not accumulate.

Notes
The server uses the Google Generative AI model (gemini-1.5-flash) to generate content and process the file.
Only Excel files (.xlsx or .xls) are supported at this time. Other file formats are not processed.
