/* ==================== SOCIAL CARDS ==================== */
.social-card {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef); /* হালকা গ্রে */
    padding: 16px;
    border-radius: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.social-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ==================== LOGIN SCREEN ==================== */
.login-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    background: rgba(0, 0, 0, 0.5); /* ডার্ক ওভারলে */
    backdrop-filter: blur(3px);
    padding: 16px;
}

.login-card {
    background: linear-gradient(145deg, #1a237e, #0d1442); /* নীল শেড */
    backdrop-filter: blur(2px);
    padding: 30px 24px;
    border-radius: 48px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 35px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(245, 176, 66, 0.5);
    z-index: 2;
}

/* ==================== TEACHER GRID ==================== */
.teacher-card {
    background: linear-gradient(145deg, #ffffff, #f0f4f8);
    border-radius: 28px;
    padding: 18px;
    text-align: center;
    border: 1px solid rgba(245, 176, 66, 0.5);
}

/* ==================== STUDENT LIST ==================== */
.student-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
    border-radius: 20px;
    margin-bottom: 8px;
}

/* ==================== FEEDBACK ==================== */
.feedback-item {
    background: linear-gradient(135deg, #fafafa, #f5f0eb);
    border-radius: 16px;
    padding: 12px;
    margin-bottom: 10px;
    border-left: 4px solid #f5b042;
}

/* ==================== TEACHER CLASS CARD ==================== */
.teacher-class-card {
    background: linear-gradient(135deg, #fff8f0, #ffffff);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid rgba(245, 176, 66, 0.2);
}

/* ==================== CLASS BUTTONS ==================== */
.class-buttons-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 20px;
    max-height: 400px;
    overflow-y: auto;
    padding: 15px 10px 15px 30px;
    background: linear-gradient(135deg, #f5f0eb, #e8e0d8);
    border-radius: 20px;
}

.class-btn {
    display: block;
    width: auto;
    min-width: 200px;
    text-align: left;
    margin: 0;
    background: linear-gradient(135deg, #e8edf2, #d5dce4);
    padding: 12px 20px 12px 25px;
    border-radius: 40px;
    cursor: pointer;
    transition: 0.2s;
    font-size: 14px;
    font-weight: 500;
    border: none;
}

.class-btn:hover {
    background: linear-gradient(135deg, #f5b042, #e69b2e);
    color: #0a163b;
    transform: translateX(8px);
}

.class-btn.active {
    background: linear-gradient(135deg, #f5b042, #e69b2e);
    color: #0a163b;
    box-shadow: 0 2px 8px rgba(245, 176, 66, 0.3);
}

/* ==================== ATTENDANCE ==================== */
.attendance-card {
    background: linear-gradient(135deg, #ffffff, #f8faff);
    border-radius: 24px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.cal-day {
    background: linear-gradient(135deg, #f8fafc, #edf2f7);
    border-radius: 12px;
    padding: 10px 4px;
    text-align: center;
    border: 1px solid #e2e8f0;
    min-height: 70px;
    transition: all 0.2s;
}

.cal-day.present {
    background: linear-gradient(135deg, #dcfce7, #86efac);
    color: #15803d;
    border-color: #86efac;
}

.cal-day.absent {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    color: #b91c1c;
    border-color: #fecaca;
}

.cal-day.today {
    border: 2px solid #f5b042;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
}

/* ==================== MODALS ==================== */
.results-card,
.about-card,
.routine-card {
    background: linear-gradient(145deg, #f0e6d8, #e8d5c8);
    padding: 30px;
    border-radius: 30px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    max-height: 80vh;
    overflow-y: auto;
}

/* ==================== INFO DATA ==================== */
.info-data {
    background: linear-gradient(145deg, #ffffff, #fef5e7);
    border-radius: 28px;
    padding: 18px;
    text-align: left;
    border: 1px solid rgba(245, 176, 66, 0.5);
}

/* ==================== STUDENT INFO CARD ==================== */
.student-info-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px;
    border-radius: 20px;
    margin-bottom: 20px;
    text-align: center;
}

/* ==================== DROPDOWN ==================== */
.dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    top: 45px;
    background: linear-gradient(145deg, #1a237e, #0d1442);
    min-width: 240px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 18px 32px rgba(0, 0, 0, 0.3);
    z-index: 1000;
}

.dropdown-content a {
    display: block;
    padding: 12px 18px;
    color: #faf0e1;
    text-decoration: none;
    border-bottom: 1px solid rgba(245, 176, 66, 0.2);
    cursor: pointer;
    font-size: 14px;
}

.dropdown-content a:hover {
    background: linear-gradient(135deg, #f5b042, #e69b2e);
    color: #0a1c3b;
}

/* ==================== BUTTONS ==================== */
.btn-green { 
    background: linear-gradient(135deg, #1e267b, #2a3599); 
    color: white; 
}

.btn-blue { 
    background: linear-gradient(135deg, #0f2c4e, #1a4a7a); 
    color: white; 
}

.btn-red { 
    background: linear-gradient(135deg, #c52828, #e63939); 
    color: white; 
}

.btn-orange { 
    background: linear-gradient(135deg, #f5b042, #e69b2e); 
    color: #1e0a3b; 
}

/* ==================== PANELS ==================== */
.panel {
    display: none;
    background: linear-gradient(145deg, #ffffff, #f8faff);
    border-radius: 28px;
    padding: 18px 16px;
    margin-bottom: 20px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
