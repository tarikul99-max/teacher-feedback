const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// =============== আপনার BDBulkSMS তথ্য ===============
// এখানে https://bdbulksms.com থেকে API Key নিবেন
const SMS_CONFIG = {
    apiKey: "আপনার_এপিআই_কি_এখানে_দিবেন",  // যেমন: "s8d7f9a8s7d6f5a4s3d2f1"
    sender: "Mastermind",
    url: "https://api.bdbulksms.com/send"
};

// =============== SMS পাঠানোর API ===============
app.post('/api/send-sms', async (req, res) => {
    console.log("📨 Request:", req.body);
    
    const { phone, studentName, className, date } = req.body;
    
    // ফোন নাম্বার চেক
    if (!phone) {
        return res.json({ success: false, error: "Phone number required" });
    }
    
    // মেসেজ তৈরি
    const message = `${studentName} ${className} শ্রেণির শিক্ষার্থী ${date} তারিখে বিদ্যালয়ে অনুপস্থিত ছিল। অনুগ্রহ করে উপস্থিতি নিশ্চিত করুন। - মাস্টারমাইন্ড অ্যাকাডেমি`;
    
    try {
        // BDBulkSMS এ কল
        const response = await axios.get(SMS_CONFIG.url, {
            params: {
                api_key: SMS_CONFIG.apiKey,
                sender: SMS_CONFIG.sender,
                number: phone,
                message: message.substring(0, 160)  // 160 ক্যারেক্টারে সীমাবদ্ধ
            }
        });
        
        console.log("SMS Response:", response.data);
        
        if (response.data.status === "success") {
            res.json({ success: true, message: "SMS sent" });
        } else {
            res.json({ success: false, error: response.data.message });
        }
        
    } catch (error) {
        console.error("Error:", error.message);
        res.json({ success: false, error: error.message });
    }
});

// =============== হেলথ চেক API ===============
app.get('/api/health', (req, res) => {
    res.json({ 
        status: "active", 
        timestamp: new Date().toISOString(),
        service: "Mastermind SMS Gateway"
    });
});

// =============== ব্যালেন্স চেক API ===============
app.get('/api/balance', async (req, res) => {
    try {
        const response = await axios.get(`https://api.bdbulksms.com/balance?api_key=${SMS_CONFIG.apiKey}`);
        res.json({ success: true, balance: response.data.balance });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ SMS API running on port ${PORT}`);
});
