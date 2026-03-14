// server.js
const express = require('express');
const cors = require('cors');

const app = express();

// CORS enable kora holo jate GitHub theke HTML data pabe
app.use(cors({
    origin: '*' // Apni chaile ekhane shudhu apnar GitHub link dite paren security-r jonno
}));

// JSON body parse korar jonno
app.use(express.json());

// Apnar POS Server er Secret Token
const AUTH_TOKEN = "Nasir:Bc1eAzlFgxiej0LdckCqdw==";

// 1. Search API (Product er nam diye khonjar jonno)
app.post('/api/search', async (req, res) => {
    try {
        const { term } = req.body;
        
        const payload = {
            "company": "10001",
            "page_size": 15,
            "page_number": 1,
            "isBrandSrc": "N",
            "searchText": term,
            "order_by": "MOST_RCNT_ADD_FIRST"
        };

        const response = await fetch("http://103.87.213.56/PFF/api/PostProductListByPageSize", {
            method: 'POST',
            headers: {
                "accept": "application/json",
                "authorization": AUTH_TOKEN,
                "content-type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("POS Server Error");
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Search Error:", error.message);
        res.status(500).json({ success: false, message: "Error fetching from POS" });
    }
});

// 2. Stock Check API (Barcode ebang Store Code diye live stock anar jonno)
app.get('/api/stock/:storeCode/:barcode', async (req, res) => {
    try {
        const { storeCode, barcode } = req.params;
        const fetchUrl = `http://103.87.213.56/PFF/api/GetProdctStockByBarcodeWithZeroStock/10001/${storeCode}/${encodeURIComponent(barcode)}?withzeros=N`;
        
        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                "accept": "application/json",
                "authorization": AUTH_TOKEN
            }
        });

        if (!response.ok) throw new Error("POS Server Error");

        const responseText = await response.text();
        const data = responseText ? JSON.parse(responseText) : [];
        res.json(data);
    } catch (error) {
        console.error("Stock Fetch Error:", error.message);
        res.status(500).json({ success: false, message: "Error fetching stock" });
    }
});

// Server Start korar code
module.exports = app;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`PFF Backend is running on port ${PORT}`);
});
