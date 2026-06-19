// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD4xuqY5FDdiEwlYpkC1cfMEN1aIwPtB_A",
    authDomain: "studentcom-3e387.firebaseapp.com",
    projectId: "studentcom-3e387",
    databaseURL: "https://studentcom-3e387-default-rtdb.firebaseio.com",
    messagingSenderId: "284949876238",
    appId: "1:284949876238:web:d6a8cde91411a033e9f65f"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Global Variables
let currentUser = { id: "", role: "", name: "", photo: "" };
let currentClass = "Class 5";
let studentsData = [];
let teacherAssignedClasses = [];
let classRoutine = {};
let teacherImageBase64 = "", studentImageBase64 = "";
let currentStudentsList = [];

// Media variables for social feed
let selectedFiles = [];
let selectedVideos = [];

// SMS API URL
const SELF_SMS_URL = "https://selfsms.onrender.com";

// Class list
const classes = [
    "Class 5", "Class 6", "Class 7", "Class 8",
    "Class 9 (Science)", "Class 9 (Commerce)", "Class 9 (Humanities)",
    "Class 10 (Science)", "Class 10 (Commerce)", "Class 10 (Humanities)",
    "SSC Special Batch (Science)", "SSC Special Batch (Commerce)", "SSC Special Batch (Humanities)"
];

const days = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

// ============ CLOSE MODAL BY CLICKING OUTSIDE ============
function closeModalOutside(event, modalId) {
    if (event.target === event.currentTarget) {
        document.getElementById(modalId).style.display = 'none';
    }
}

// Close modal with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.result-modal, .about-modal, .routine-modal').forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }
});

function escapeHtml(str) { 
    if(!str) return ''; 
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]); 
}

function getBanglaDayName(englishDay) {
    const dayMap = { 'Saturday': 'শনিবার', 'Sunday': 'রবিবার', 'Monday': 'সোমবার', 'Tuesday': 'মঙ্গলবার', 'Wednesday': 'বুধবার', 'Thursday': 'বৃহস্পতিবার', 'Friday': 'শুক্রবার' };
    return dayMap[englishDay] || englishDay;
}

function getTodayDayName() {
    const daysEng = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return getBanglaDayName(daysEng[new Date().getDay()]);
}

function getTomorrowDayName() {
    const daysEng = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getBanglaDayName(daysEng[tomorrow.getDay()]);
}

function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    let cleanNumber = phoneNumber.toString().replace(/[^0-9]/g, '');
    
    if (cleanNumber.length === 13 && cleanNumber.startsWith('8801')) return cleanNumber;
    if (cleanNumber.length === 11 && cleanNumber.startsWith('01')) return '880' + cleanNumber.substring(1);
    if (cleanNumber.length === 10 && cleanNumber.startsWith('1')) return '880' + cleanNumber;
    if (cleanNumber.length === 10) return '8801' + cleanNumber;
    if (cleanNumber.length === 9) return '8801' + cleanNumber;
    
    let last10 = cleanNumber.slice(-10);
    return '8801' + last10;
}

async function checkSMSService() {
    try {
        const response = await fetch(`${SELF_SMS_URL}/health`);
        const result = await response.json();
        console.log("✅ SMS Service Status:", result);
        return result.status === 'active';
    } catch (error) {
        console.error("❌ SMS Service not reachable:", error);
        return false;
    }
}

async function sendAbsentSMS(phoneNumber, studentName, className, date, teacherName) {
    if (!phoneNumber) return { success: false, error: "ফোন নম্বর প্রয়োজন" };
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!formattedPhone || formattedPhone.length !== 13) {
        return { success: false, error: `ফোন নম্বর সঠিক নয়: ${phoneNumber}` };
    }
    
    const banglaDate = date ? new Date(date).toLocaleDateString('bn-BD') : 'আজ';
    const message = `মাস্টারমাইন্ড অ্যাকাডেমি\n\nপ্রিয় অভিভাবক,\n${studentName || 'শিক্ষার্থী'} ${banglaDate} তারিখে ${className || ''} ক্লাসে উপস্থিত ছিলেন না।\n\nদয়া করে সন্তানের উপস্থিতি নিশ্চিত করুন।\n\nধন্যবাদ\n${teacherName || 'মাস্টারমাইন্ড অ্যাকাডেমি'}`;
    
    try {
        const response = await fetch(`${SELF_SMS_URL}/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formattedPhone, message: message, studentName, className, date })
        });
        const result = await response.json();
        console.log("📨 SMS Response:", result);
        return result;
    } catch (error) {
        console.error("❌ SMS Error:", error);
        return { success: false, error: error.message };
    }
}

window.testSMS = async function(phone = "+8801889343480") {
    const result = await sendAbsentSMS(phone, "পরীক্ষা শিক্ষার্থী", "টেস্ট ক্লাস", new Date().toISOString().split('T')[0], "প্রশাসক");
    alert(result.success ? "✅ টেস্ট SMS সফল!" : `❌ ব্যর্থ: ${result.error}`);
    return result;
};

const defaultRoutine = {
    "Class 5": { "শনিবার": "গণিত", "রবিবার": "বাংলা", "সোমবার": "ইংরেজি", "মঙ্গলবার": "বিজ্ঞান", "বুধবার": "সামাজিক", "বৃহস্পতিবার": "ধর্ম", "শুক্রবার": "ছুটি" },
    "Class 6": { "শনিবার": "বিজ্ঞান", "রবিবার": "গণিত", "সোমবার": "বাংলা", "মঙ্গলবার": "ইংরেজি", "বুধবার": "কম্পিউটার", "বৃহস্পতিবার": "সাধারণ জ্ঞান", "শুক্রবার": "ছুটি" },
    "Class 7": { "শনিবার": "ইংরেজি", "রবিবার": "বিজ্ঞান", "সোমবার": "গণিত", "মঙ্গলবার": "বাংলা", "বুধবার": "সামাজিক", "বৃহস্পতিবার": "ধর্ম", "শুক্রবার": "ছুটি" },
    "Class 8": { "শনিবার": "বাংলা", "রবিবার": "ইংরেজি", "সোমবার": "গণিত", "মঙ্গলবার": "বিজ্ঞান", "বুধবার": "কৃষি", "বৃহস্পতিবার": "কম্পিউটার", "শুক্রবার": "ছুটি" },
    "Class 9 (Science)": { "শনিবার": "পদার্থবিজ্ঞান", "রবিবার": "রসায়ন", "সোমবার": "জীববিজ্ঞান", "মঙ্গলবার": "উচ্চতর গণিত", "বুধবার": "বাংলা", "বৃহস্পতিবার": "ইংরেজি", "শুক্রবার": "ছুটি" },
    "Class 9 (Commerce)": { "শনিবার": "হিসাববিজ্ঞান", "রবিবার": "ব্যবসায় উদ্যোগ", "সোমবার": "অর্থনীতি", "মঙ্গলবার": "গণিত", "বুধবার": "বাংলা", "বৃহস্পতিবার": "ইংরেজি", "শুক্রবার": "ছুটি" },
    "Class 9 (Humanities)": { "শনিবার": "ইতিহাস", "রবিবার": "ভূগোল", "সোমবার": "নাগরিকতা", "মঙ্গলবার": "অর্থনীতি", "বুধবার": "বাংলা", "বৃহস্পতিবার": "ইংরেজি", "শুক্রবার": "ছুটি" },
    "Class 10 (Science)": { "শনিবার": "রসায়ন", "রবিবার": "পদার্থবিজ্ঞান", "সোমবার": "জীববিজ্ঞান", "মঙ্গলবার": "উচ্চতর গণিত", "বুধবার": "ইংরেজি", "বৃহস্পতিবার": "বাংলা", "শুক্রবার": "ছুটি" },
    "Class 10 (Commerce)": { "শনিবার": "ব্যবস্থাপনা", "রবিবার": "হিসাববিজ্ঞান", "সোমবার": "ব্যবসায় গণিত", "মঙ্গলবার": "অর্থনীতি", "বুধবার": "ইংরেজি", "বৃহস্পতিবার": "বাংলা", "শুক্রবার": "ছুটি" },
    "Class 10 (Humanities)": { "শনিবার": "ইতিহাস", "রবিবার": "ভূগোল", "সোমবার": "সমাজবিজ্ঞান", "মঙ্গলবার": "নীতিশাস্ত্র", "বুধবার": "ইংরেজি", "বৃহস্পতিবার": "বাংলা", "শুক্রবার": "ছুটি" },
    "SSC Special Batch (Science)": { "শনিবার": "বাংলা (MCQ)", "রবিবার": "ইংরেজি (MCQ)", "সোমবার": "গণিত (MCQ)", "মঙ্গলবার": "সাধারণ বিজ্ঞান", "বুধবার": "মডেল টেস্ট", "বৃহস্পতিবার": "মডেল টেস্ট", "শুক্রবার": "ছুটি" },
    "SSC Special Batch (Commerce)": { "শনিবার": "বাংলা (MCQ)", "রবিবার": "ইংরেজি (MCQ)", "সোমবার": "ব্যবসায় গণিত", "মঙ্গলবার": "হিসাববিজ্ঞান", "বুধবার": "মডেল টেস্ট", "বৃহস্পতিবার": "মডেল টেস্ট", "শুক্রবার": "ছুটি" },
    "SSC Special Batch (Humanities)": { "শনিবার": "বাংলা (MCQ)", "রবিবার": "ইংরেজি (MCQ)", "সোমবার": "ইতিহাস", "মঙ্গলবার": "ভূগোল", "বুধবার": "মডেল টেস্ট", "বৃহস্পতিবার": "মডেল টেস্ট", "শুক্রবার": "ছুটি" }
};

async function loadRoutineFromFirebase() {
    const snap = await db.ref('class_routines').get();
    if(snap.exists()) { classRoutine = snap.val(); }
    else { classRoutine = JSON.parse(JSON.stringify(defaultRoutine)); await db.ref('class_routines').set(classRoutine); }
    return classRoutine;
}

async function showTodayTomorrowRoutine() {
    const routine = await loadRoutineFromFirebase();
    const container = document.getElementById('todayTomorrowRoutine');
    if(!container) return;
    const todayName = getTodayDayName();
    const tomorrowName = getTomorrowDayName();
    
    if(currentUser.role === 'student') {
        let clsRoutine = routine[currentClass] || routine["Class 5"];
        container.innerHTML = `
            <div class="routine-side-by-side">
                <div class="today-routine-card">
                    <h3>📚 আজকের ক্লাস (${todayName})</h3>
                    <div class="routine-subject">${clsRoutine[todayName] || 'ক্লাস নেই'}</div>
                    <p style="margin-top:10px;">আপনার ক্লাস: ${currentClass}</p>
                </div>
                <div class="tomorrow-routine-card">
                    <h3>📚 আগামীকালের ক্লাস (${tomorrowName})</h3>
                    <div class="routine-subject">${clsRoutine[tomorrowName] || 'ক্লাস নেই'}</div>
                </div>
            </div>
        `;
    } else {
        let todayHtml = `<div class="today-routine-card"><h3>📚 আজকের ক্লাস (${todayName})</h3>`;
        let tomorrowHtml = `<div class="tomorrow-routine-card"><h3>📚 আগামীকালের ক্লাস (${tomorrowName})</h3>`;
        for(let cls of classes) {
            let clsRoutine = routine[cls] || routine["Class 5"];
            todayHtml += `<p><strong>${cls}:</strong> ${clsRoutine[todayName] || 'ক্লাস নেই'}</p>`;
            tomorrowHtml += `<p><strong>${cls}:</strong> ${clsRoutine[tomorrowName] || 'ক্লাস নেই'}</p>`;
        }
        todayHtml += `</div>`;
        tomorrowHtml += `</div>`;
        container.innerHTML = `<div class="routine-side-by-side">${todayHtml}${tomorrowHtml}</div>`;
    }
}

async function loadDashboard() {
    const snap = await db.ref('registered_teachers').get();
    const container = document.getElementById('teachersGrid');
    if(!snap.exists()) { container.innerHTML = '<div class="empty-state">কোন শিক্ষক নেই</div>'; return; }
    let html = '';
    for(let key in snap.val()) {
        let t = snap.val()[key];
        let photo = t.photo || `https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=${t.teacher_name}`;
        html += `<div class="teacher-card"><img src="${photo}"><h3>${escapeHtml(t.teacher_name)}</h3><p>📚 ${t.classes?.join(', ') || '—'}</p></div>`;
    }
    container.innerHTML = html;
}

async function loadStudentOwnAttendance() {
    if(currentUser.role !== 'student') return;
    const classKey = currentClass.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
    const studentId = currentUser.id;
    let year = new Date().getFullYear(), month = new Date().getMonth();
    
    const updateCalendar = async () => {
        const daysInMonth = new Date(year, month+1, 0).getDate();
        let presentCount = 0, absentCount = 0, totalDays = 0;
        let attendanceHtml = `<div class="calendar-grid">`;
        const weekdays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
        weekdays.forEach(day => attendanceHtml += `<div class="cal-day-header">${day}</div>`);
        const firstDay = new Date(year, month, 1).getDay();
        for(let i=0; i<firstDay; i++) attendanceHtml += `<div class="cal-day empty"></div>`;
        
        for(let d=1; d<=daysInMonth; d++) {
            let dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            let snap = await db.ref(`attendances/${classKey}/${dateStr}/${studentId}`).get();
            let isPresent = snap.exists() && snap.val() === true;
            let isToday = (new Date().toISOString().split('T')[0] === dateStr);
            let todayClass = isToday ? ' today' : '';
            
            if(isPresent) { 
                presentCount++; totalDays++; 
                attendanceHtml += `<div class="cal-day present${todayClass}"><div class="date-num">${d}</div><div class="status-icon">✅ উপস্থিত</div></div>`; 
            }
            else if(snap.exists() && snap.val() === false) { 
                absentCount++; totalDays++; 
                attendanceHtml += `<div class="cal-day absent${todayClass}"><div class="date-num">${d}</div><div class="status-icon">❌ অনুপস্থিত</div></div>`; 
            }
            else {
                attendanceHtml += `<div class="cal-day${todayClass}"><div class="date-num">${d}</div><div class="status-icon">—</div></div>`;
            }
        }
        attendanceHtml += `</div>`;
        document.getElementById('studentCalendarGrid').innerHTML = attendanceHtml;
        let percentage = totalDays ? ((presentCount/totalDays)*100).toFixed(1) : 0;
        document.getElementById('studentSummary').innerHTML = `
            <div class="summary-item"><div class="number">${presentCount}</div><div>উপস্থিত</div></div>
            <div class="summary-item"><div class="number">${absentCount}</div><div>অনুপস্থিত</div></div>
            <div class="summary-item"><div class="number">${percentage}%</div><div>উপস্থিতির হার</div></div>
            <div class="summary-item"><div class="number">${totalDays}</div><div>মোট কার্যদিবস</div></div>
        `;
    };
    
    const months = ['জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    let selectorHtml = `<select id="studentMonthYearPicker">`;
    for(let y of [2025, 2026]) for(let m=0; m<12; m++) selectorHtml += `<option value="${y}-${m}" ${(y===year && m===month)?'selected':''}>${months[m]} ${y}</option>`;
    selectorHtml += `</select><button class="btn btn-blue" id="refreshStudentMonthBtn">দেখুন</button>`;
    document.getElementById('studentMonthSelector').innerHTML = selectorHtml;
    document.getElementById('refreshStudentMonthBtn').onclick = () => { const val = document.getElementById('studentMonthYearPicker').value; [year, month] = val.split('-').map(Number); updateCalendar(); };
    await updateCalendar();
}

async function loadTeacherPanel() {
    const snap = await db.ref(`registered_teachers/${currentUser.id}`).get();
    if(!snap.exists()) return;
    const teacher = snap.val();
    teacherAssignedClasses = teacher.classes || [];
    let photoHtml = teacher.photo ? `<img src="${teacher.photo}" style="width:80px;height:80px;border-radius:50%;">` : `<i class="fas fa-chalkboard-user" style="font-size:60px;"></i>`;
    document.getElementById('teacherProfileArea').innerHTML = `<div>${photoHtml}<h3>${escapeHtml(teacher.teacher_name)}</h3><p>আইডি: ${teacher.teacher_id}</p></div>`;
    
    if(teacherAssignedClasses.length === 0) {
        document.getElementById('teacherAssignedClasses').innerHTML = '<div class="teacher-class-card"><p>আপনার কোনো ক্লাস বরাদ্দ নেই।</p></div>';
        return;
    }
    let classHtml = `<div class="teacher-class-card"><h4>আমার ক্লাসসমূহ</h4><div style="display:flex; flex-wrap:wrap; gap:10px;">`;
    for(let cls of teacherAssignedClasses) { classHtml += `<button class="btn btn-blue teacher-class-btn" data-class="${cls}">📖 ${cls}</button>`; }
    classHtml += `</div></div>`;
    document.getElementById('teacherAssignedClasses').innerHTML = classHtml;
    document.querySelectorAll('.teacher-class-btn').forEach(btn => { btn.onclick = () => loadTeacherClassStudents(btn.dataset.class); });
    if(teacherAssignedClasses.length > 0) await loadTeacherClassStudents(teacherAssignedClasses[0]);
}

async function loadTeacherClassStudents(className) {
    const classKey = className.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
    const snap = await db.ref(`class_sheets/${classKey}/students`).get();
    const students = snap.exists() ? snap.val() : [];
    if(students.length === 0) { document.getElementById('teacherClassStudents').innerHTML = `<div class="teacher-class-card"><h4>${className}</h4><p>কোন ছাত্র/ছাত্রী নেই।</p></div>`; return; }
    let html = `<div class="teacher-class-card"><h4>${className} - ছাত্র/ছাত্রীবৃন্দ</h4>`;
    students.forEach(s => {
        html += `<div class="student-list-item"><img src="${s.photo || 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name='+s.name}"><div><strong>${escapeHtml(s.name)}</strong><br><small>ID: ${s.id}</small><br>${s.guardian_phone ? `<small>📱 ${s.guardian_phone}</small>` : '<small>⚠️ ফোন নেই</small>'}</div></div>`;
    });
    html += `</div>`;
    document.getElementById('teacherClassStudents').innerHTML = html;
}

async function loadStudentFeedback() {
    const area = document.getElementById('studentFeedbackArea');
    if(!area) return;
    const teachersSnap = await db.ref('registered_teachers').get();
    if(!teachersSnap.exists()) { area.innerHTML='<div class="empty-state">কোন শিক্ষক নেই</div>'; return; }
    const allTeachers = Object.values(teachersSnap.val());
    const classTeachers = allTeachers.filter(teacher => teacher.classes && teacher.classes.includes(currentClass));
    if(classTeachers.length === 0) { area.innerHTML='<div class="empty-state">আপনার ক্লাসের কোনো শিক্ষক নেই।</div>'; return; }
    const classKeyForDB = currentClass.replace(/\s+/g, '_').replace(/\(/g,'').replace(/\)/g,'');
    area.innerHTML = '';
    for(let t of classTeachers) {
        const existing = await db.ref(`secret_evaluations/${classKeyForDB}/${currentUser.id}/${t.teacher_id}`).get();
        const comment = existing.exists() ? existing.val().comment : '';
        const div = document.createElement('div');
        div.className = 'feedback-item';
        div.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><img src="${t.photo || 'https://ui-avatars.com/api/?background=1e7b4a&color=fff&name='+t.teacher_name}" style="width:40px;height:40px;border-radius:50%;"><strong>${escapeHtml(t.teacher_name)}</strong></div><textarea id="fb_${t.teacher_id}" rows="2" placeholder="আপনার মতামত দিন...">${escapeHtml(comment)}</textarea><div style="text-align:right;"><span id="saved_${t.teacher_id}" style="color:green; display:none;">✓ সংরক্ষিত</span></div>`;
        area.appendChild(div);
        const ta = document.getElementById(`fb_${t.teacher_id}`);
        let timer;
        ta.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                await db.ref(`secret_evaluations/${classKeyForDB}/${currentUser.id}/${t.teacher_id}`).set({ studentName: currentUser.name, teacherName: t.teacher_name, comment: ta.value, timestamp: new Date().toISOString() });
                const savedSpan = document.getElementById(`saved_${t.teacher_id}`);
                if(savedSpan) { savedSpan.style.display = 'inline-block'; setTimeout(()=>savedSpan.style.display='none', 1500); }
            }, 700);
        });
    }
}

async function initAttendancePanel() {
    const teacherSection = document.getElementById('teacherAttendanceSection');
    const studentSection = document.getElementById('studentHistorySection');
    if(currentUser.role === 'student') {
        if(teacherSection) teacherSection.style.display = 'none';
        if(studentSection) studentSection.style.display = 'block';
        await loadStudentOwnAttendance();
    } else if(currentUser.role === 'teacher' || currentUser.role === 'admin') {
        if(teacherSection) teacherSection.style.display = 'block';
        if(studentSection) studentSection.style.display = 'none';
        await loadAttendanceClassSelect();
        document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('loadStudentsBtn').onclick = () => loadStudentsForDate();
        document.getElementById('saveAttendanceBtn').onclick = () => saveAttendance();
        await loadClassMonthlyCalendar();
    }
}

async function loadAttendanceClassSelect() {
    const classSelect = document.getElementById('attendanceClassSelect');
    if(!classSelect) return;
    if(currentUser.role === 'teacher') classSelect.innerHTML = teacherAssignedClasses.map(c => `<option value="${c}">${c}</option>`).join('');
    else classSelect.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join('');
}

async function loadStudentsForDate() {
    const className = document.getElementById('attendanceClassSelect').value;
    const date = document.getElementById('attendanceDate').value;
    if(!className || !date) { alert('ক্লাস এবং তারিখ নির্বাচন করুন'); return; }
    if(currentUser.role === 'teacher' && !teacherAssignedClasses.includes(className)) { alert('আপনি এই ক্লাসে উপস্থিতি দিতে পারবেন না।'); return; }
    const classKey = className.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
    const studentsSnap = await db.ref(`class_sheets/${classKey}/students`).get();
    const students = studentsSnap.exists() ? studentsSnap.val() : [];
    if(students.length === 0) { alert('এই ক্লাসে কোনো ছাত্র/ছাত্রী নেই'); return; }
    let attendanceMap = {};
    const attSnap = await db.ref(`attendances/${classKey}/${date}`).get();
    if(attSnap.exists()) attendanceMap = attSnap.val();
    currentStudentsList = students.map(s => ({ ...s, present: attendanceMap[s.id] === true }));
    let html = `<div class="attendance-info">মোট ছাত্র/ছাত্রী: ${students.length} জন</div>`;
    currentStudentsList.forEach((s, idx) => {
        let photo = s.photo || `https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=${s.name}`;
        let guardianInfo = s.guardian_phone ? `<small>📱 ${s.guardian_phone}</small>` : '<small>⚠️ ফোন নেই</small>';
        html += `<div class="student-att-row"><img src="${photo}" style="width:40px;height:40px;border-radius:50%;"><div style="flex:1;"><strong>${escapeHtml(s.name)}</strong><br><small>ID: ${s.id}</small><br>${guardianInfo}</div><label class="toggle-switch"><input type="checkbox" class="att-student-cb" data-idx="${idx}" ${s.present ? 'checked' : ''}><span class="slider"></span></label></div>`;
    });
    document.getElementById('studentAttendanceList').innerHTML = html;
    document.getElementById('selectedDateDisplay').innerText = date;
    document.getElementById('studentAttendanceSection').style.display = 'block';
    document.querySelectorAll('.att-student-cb').forEach(cb => { cb.addEventListener('change', (e) => { let idx = parseInt(cb.dataset.idx); currentStudentsList[idx].present = cb.checked; }); });
}

async function saveAttendance() {
    const className = document.getElementById('attendanceClassSelect').value;
    const date = document.getElementById('attendanceDate').value;
    if(!className || !date) { alert('❌ ক্লাস এবং তারিখ নির্বাচন করুন'); return; }
    
    const classKey = className.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
    let attendanceData = {};
    currentStudentsList.forEach(s => { attendanceData[s.id] = s.present === true; });
    await db.ref(`attendances/${classKey}/${date}`).set(attendanceData);
    
    const absentStudents = currentStudentsList.filter(s => s.present !== true && s.guardian_phone && s.guardian_phone.length >= 10);
    const presentCount = currentStudentsList.filter(s => s.present === true).length;
    const absentCount = currentStudentsList.length - presentCount;
    
    let smsSentCount = 0, smsFailedList = [];
    
    if(absentStudents.length > 0) {
        const loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:20px; border-radius:10px; z-index:9999; box-shadow:0 0 10px rgba(0,0,0,0.3); text-align:center;';
        loadingMsg.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${absentStudents.length} জন অভিভাবককে SMS পাঠানো হচ্ছে...`;
        document.body.appendChild(loadingMsg);
        
        for(let i = 0; i < absentStudents.length; i++) {
            const student = absentStudents[i];
            loadingMsg.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${i+1}/${absentStudents.length} - ${student.name} কে SMS পাঠানো হচ্ছে...`;
            const result = await sendAbsentSMS(student.guardian_phone, student.name, className, date, currentUser.name || (currentUser.role === 'admin' ? 'প্রশাসক' : 'শিক্ষক'));
            if(result.success) smsSentCount++;
            else smsFailedList.push(student.name);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        loadingMsg.remove();
        
        let msg = `✅ উপস্থিতি সংরক্ষিত!\n📊 উপস্থিত: ${presentCount}\n📋 অনুপস্থিত: ${absentCount}`;
        if(smsSentCount > 0) msg += `\n✅ SMS সফল: ${smsSentCount}`;
        if(smsFailedList.length > 0) msg += `\n❌ ব্যর্থ: ${smsFailedList.join(', ')}`;
        alert(msg);
    } else {
        alert(absentCount === 0 ? `✅ সবাই উপস্থিত!` : `✅ উপস্থিতি সংরক্ষিত!\n⚠️ ${absentCount} জনের ফোন নম্বর নেই।`);
    }
    await loadClassMonthlyCalendar();
}

async function loadClassMonthlyCalendar() {
    const className = document.getElementById('attendanceClassSelect').value;
    if(!className) return;
    const classKey = className.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
    let year = new Date().getFullYear(), month = new Date().getMonth();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    let attendanceData = {};
    for(let d=1; d<=daysInMonth; d++) {
        let dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        let snap = await db.ref(`attendances/${classKey}/${dateStr}`).get();
        if(snap.exists()) { let data = snap.val(); let total = Object.keys(data).length; let present = Object.values(data).filter(v=>v===true).length; attendanceData[dateStr] = { present, total }; }
    }
    let html = `<div class="calendar-grid">`;
    const weekdays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
    weekdays.forEach(day => html += `<div class="cal-day-header">${day}</div>`);
    for(let i=0; i<firstDay; i++) html += `<div class="cal-day empty"></div>`;
    for(let d=1; d<=daysInMonth; d++) {
        let dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        let att = attendanceData[dateStr];
        if(att) html += `<div class="cal-day present"><div class="date-num">${d}</div><div class="status-icon">✅ ${att.present}/${att.total}</div></div>`;
        else html += `<div class="cal-day absent"><div class="date-num">${d}</div><div class="status-icon">❌ ডাটা নেই</div></div>`;
    }
    html += `</div>`;
    const months = ['জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const monthSelector = `<select id="classMonthYearSelect"><option value="${year}-${month}" selected>${months[month]} ${year}</option></select><button class="btn btn-blue" id="refreshClassMonthBtn">দেখুন</button>`;
    document.getElementById('classMonthSelector').innerHTML = monthSelector;
    document.getElementById('refreshClassMonthBtn').onclick = () => loadClassMonthlyCalendar();
    document.getElementById('classMonthlyCalendar').innerHTML = html;
}

// ==================== FACEBOOK-LIKE SOCIAL FEED WITH NESTED COMMENTS ====================

function setupMediaPreview() {
    const fileInput = document.getElementById('feedImageInput');
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (!fileInput) return;
    
    fileInput.removeEventListener('change', handleFileChange);
    fileInput.addEventListener('change', handleFileChange);
}

function handleFileChange(e) {
    selectedFiles = [];
    selectedVideos = [];
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (!previewContainer) return;
    previewContainer.innerHTML = '';
    
    const files = Array.from(e.target.files);
    const maxFiles = 10;
    
    if (files.length > maxFiles) {
        alert(`সর্বোচ্চ ${maxFiles}টি মিডিয়া ফাইল আপলোড করতে পারবেন।`);
        document.getElementById('feedImageInput').value = '';
        return;
    }
    
    let imageCount = 0;
    let videoCount = 0;
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            if (imageCount < 10) {
                selectedFiles.push(file);
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewDiv = createMediaPreview(e.target.result, 'image', selectedFiles.indexOf(file));
                    previewContainer.appendChild(previewDiv);
                };
                reader.readAsDataURL(file);
                imageCount++;
            } else {
                alert('সর্বোচ্চ 10টি ছবি আপলোড করতে পারবেন');
            }
        } else if (file.type.startsWith('video/')) {
            if (videoCount < 1) {
                if (file.size > 100 * 1024 * 1024) {
                    alert(`"${file.name}" ভিডিওটি 100MB এর বেশি। দয়া করে ছোট ভিডিও ব্যবহার করুন।`);
                    return;
                }
                selectedVideos.push(file);
                const videoURL = URL.createObjectURL(file);
                const previewDiv = createMediaPreview(videoURL, 'video', selectedVideos.indexOf(file));
                previewContainer.appendChild(previewDiv);
                videoCount++;
            } else {
                alert('সর্বোচ্চ ১টি ভিডিও আপলোড করতে পারবেন');
            }
        } else {
            alert(`"${file.name}" সাপোর্টেড নয়। শুধু ছবি (.jpg, .png, .gif) এবং ভিডিও (.mp4, .webm) আপলোড করুন।`);
        }
    });
}

function createMediaPreview(src, type, index) {
    const previewDiv = document.createElement('div');
    previewDiv.style.position = 'relative';
    previewDiv.style.display = 'inline-block';
    previewDiv.style.margin = '5px';
    
    if (type === 'image') {
        previewDiv.innerHTML = `
            <img src="${src}" style="width:100px; height:100px; object-fit:cover; border-radius:10px; border:2px solid #1877f2;">
            <button onclick="window.removeMedia(${index}, 'image')" style="position:absolute; top:-8px; right:-8px; background:#e74c3c; color:white; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer; font-size:14px; line-height:1;">×</button>
        `;
    } else {
        previewDiv.innerHTML = `
            <video src="${src}" style="width:100px; height:100px; object-fit:cover; border-radius:10px; border:2px solid #1877f2;" muted preload="metadata"></video>
            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.6); border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">
                <i class="fas fa-play" style="color:white; font-size:12px;"></i>
            </div>
            <button onclick="window.removeMedia(${index}, 'video')" style="position:absolute; top:-8px; right:-8px; background:#e74c3c; color:white; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer; font-size:14px; line-height:1;">×</button>
        `;
    }
    
    return previewDiv;
}

window.removeMedia = function(index, type) {
    if (type === 'image' && index >= 0 && index < selectedFiles.length) {
        selectedFiles.splice(index, 1);
    } else if (type === 'video' && index >= 0 && index < selectedVideos.length) {
        selectedVideos.splice(index, 1);
        const previewContainer = document.getElementById('imagePreviewContainer');
        if(previewContainer) {
            const videos = previewContainer.querySelectorAll('video');
            videos.forEach(video => {
                if(video.src) URL.revokeObjectURL(video.src);
            });
        }
    }
    
    const fileInput = document.getElementById('feedImageInput');
    if(fileInput) fileInput.value = '';
    const previewContainer = document.getElementById('imagePreviewContainer');
    if(!previewContainer) return;
    previewContainer.innerHTML = '';
    
    selectedFiles.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewDiv = createMediaPreview(e.target.result, 'image', idx);
            previewContainer.appendChild(previewDiv);
        };
        reader.readAsDataURL(file);
    });
    
    selectedVideos.forEach((video, idx) => {
        const videoURL = URL.createObjectURL(video);
        const previewDiv = createMediaPreview(videoURL, 'video', idx);
        previewContainer.appendChild(previewDiv);
    });
};

async function uploadFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

async function uploadMultipleMedia(files, isVideo = false) {
    const uploadedMedia = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (isVideo ? file.type.startsWith('video/') : file.type.startsWith('image/')) {
            try {
                if (isVideo && file.size > 10 * 1024 * 1024) {
                    alert(`"${file.name}" ভিডিওটি 10MB এর বেশি। ছোট ভিডিও ব্যবহার করুন।`);
                    continue;
                }
                const base64 = await uploadFile(file);
                uploadedMedia.push({ 
                    type: isVideo ? 'video' : 'image', 
                    data: base64,
                    name: file.name,
                    size: file.size
                });
            } catch(error) {
                console.error('Upload error:', error);
                alert(`"${file.name}" আপলোড করতে ব্যর্থ হয়েছে`);
            }
        } else {
            alert(`"${file.name}" সাপোর্টেড নয়। শুধু ছবি এবং ভিডিও আপলোড করুন।`);
        }
    }
    return uploadedMedia;
}

window.publishPost = async () => {
    let cap = document.getElementById('feedCaption').value.trim();
    if(!cap) { 
        alert('ক্যাপশন লিখুন'); 
        return; 
    }
    
    let author = currentUser.role === 'admin' ? '🎓 প্রশাসক' : (currentUser.role === 'teacher' ? `👨‍🏫 ${currentUser.name}` : `🧑‍🎓 ${currentUser.name}`);
    
    let media = [];
    
    const publishBtn = document.querySelector('#socialFeedPanel .fb-create-post button:last-child');
    const originalText = publishBtn?.innerHTML;
    if(publishBtn) {
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পোস্ট করা হচ্ছে...';
        publishBtn.disabled = true;
    }
    
    try {
        if (selectedFiles.length > 0) {
            const imageMedia = await uploadMultipleMedia(selectedFiles, false);
            media.push(...imageMedia);
        }
        
        if (selectedVideos.length > 0) {
            const videoMedia = await uploadMultipleMedia(selectedVideos, true);
            media.push(...videoMedia);
        }
        
        await db.ref('social_feed').push({
            caption: cap,
            media: media,
            author: author,
            authorId: currentUser.id,
            authorRole: currentUser.role,
            timestamp: Date.now(),
            userId: currentUser.id,
            reactions: { '👍': 0, '❤️': 0, '😢': 0, '😲': 0, '🥳': 0, '🔥': 0, '🤔': 0 },
            userReactions: {},
            comments: {}
        });
        
        document.getElementById('feedCaption').value = '';
        document.getElementById('feedImageInput').value = '';
        document.getElementById('imagePreviewContainer').innerHTML = '';
        selectedFiles = [];
        selectedVideos = [];
        alert('✅ পোস্ট প্রকাশিত হয়েছে!');
    } catch(error) {
        console.error('Publish error:', error);
        alert('পোস্ট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
        if(publishBtn) {
            publishBtn.innerHTML = originalText;
            publishBtn.disabled = false;
        }
    }
};

window.deletePost = async (postId, postAuthorId) => {
    const canDelete = (currentUser.role === 'admin') || (currentUser.id === postAuthorId);
    if(!canDelete) { alert('⚠️ আপনি শুধু আপনার নিজের পোস্ট ডিলিট করতে পারবেন!'); return; }
    if(confirm('পোস্টটি ডিলিট করতে চান?')) {
        await db.ref(`social_feed/${postId}`).remove();
        alert('✅ পোস্ট ডিলিট করা হয়েছে!');
    }
};

window.addReaction = async (postId, emoji) => {
    const postRef = db.ref(`social_feed/${postId}`);
    const snap = await postRef.get();
    if(snap.exists()) {
        const post = snap.val();
        let reactions = post.reactions || { '👍': 0, '❤️': 0, '😢': 0, '😲': 0, '🥳': 0, '🔥': 0, '🤔': 0 };
        let userReactions = post.userReactions || {};
        const userId = currentUser.id;
        const oldEmoji = userReactions[userId];
        
        if(oldEmoji === emoji) {
            reactions[emoji] = Math.max(0, (reactions[emoji] || 0) - 1);
            delete userReactions[userId];
        } else {
            if(oldEmoji && reactions[oldEmoji]) reactions[oldEmoji] = Math.max(0, (reactions[oldEmoji] || 0) - 1);
            reactions[emoji] = (reactions[emoji] || 0) + 1;
            userReactions[userId] = emoji;
        }
        await postRef.update({ reactions: reactions, userReactions: userReactions });
    }
};

window.showReactionPicker = (postId, buttonElement) => {
    const picker = document.getElementById(`reactionPicker_${postId}`);
    if(picker.style.display === 'flex') {
        picker.style.display = 'none';
    } else {
        document.querySelectorAll('.reaction-picker').forEach(p => p.style.display = 'none');
        picker.style.display = 'flex';
        const rect = buttonElement.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.bottom = 'auto';
        picker.style.top = `${rect.top - 50}px`;
        picker.style.left = `${rect.left}px`;
        
        setTimeout(() => {
            picker.style.display = 'none';
        }, 3000);
    }
};

window.showReplyInput = (postId, parentCommentId, authorName) => {
    const replyDiv = document.getElementById(`reply_input_${postId}_${parentCommentId}`);
    if(replyDiv.style.display === 'none') {
        replyDiv.style.display = 'block';
        const input = document.getElementById(`reply_text_${postId}_${parentCommentId}`);
        if(input) input.placeholder = `${authorName} কে উত্তর দিন...`;
        input.focus();
    } else {
        replyDiv.style.display = 'none';
    }
};

window.hideReplyInput = (postId, parentCommentId) => {
    const replyDiv = document.getElementById(`reply_input_${postId}_${parentCommentId}`);
    replyDiv.style.display = 'none';
    const input = document.getElementById(`reply_text_${postId}_${parentCommentId}`);
    if(input) input.value = '';
};

window.addNestedComment = async (postId, parentCommentId, parentAuthorName) => {
    const input = document.getElementById(`reply_text_${postId}_${parentCommentId}`);
    const replyText = input.value.trim();
    if(!replyText) { alert('মন্তব্য লিখুন'); return; }
    
    const commentData = {
        text: replyText,
        author: currentUser.name,
        authorId: currentUser.id,
        authorRole: currentUser.role,
        timestamp: Date.now(),
        replies: {}
    };
    
    const postRef = db.ref(`social_feed/${postId}/comments/${parentCommentId}/replies`);
    const newReplyRef = postRef.push();
    await newReplyRef.set(commentData);
    
    input.value = '';
    document.getElementById(`reply_input_${postId}_${parentCommentId}`).style.display = 'none';
};

window.addComment = async (postId) => {
    const input = document.getElementById(`comment_input_${postId}`);
    const commentText = input.value.trim();
    if(!commentText) { alert('মন্তব্য লিখুন'); return; }
    
    const commentData = {
        text: commentText,
        author: currentUser.name,
        authorId: currentUser.id,
        authorRole: currentUser.role,
        timestamp: Date.now(),
        replies: {}
    };
    
    const postRef = db.ref(`social_feed/${postId}/comments`);
    const newCommentRef = postRef.push();
    await newCommentRef.set(commentData);
    
    input.value = '';
};

window.deleteComment = async (postId, commentId, commentAuthorId) => {
    const canDelete = (currentUser.role === 'admin') || (currentUser.id === commentAuthorId);
    if(!canDelete) { alert('⚠️ আপনি শুধু আপনার নিজের মন্তব্য ডিলিট করতে পারবেন!'); return; }
    if(confirm('মন্তব্যটি ডিলিট করতে চান?')) {
        await db.ref(`social_feed/${postId}/comments/${commentId}`).remove();
        alert('✅ মন্তব্য ডিলিট করা হয়েছে!');
    }
};

window.deleteReply = async (postId, commentId, replyId, replyAuthorId) => {
    const canDelete = (currentUser.role === 'admin') || (currentUser.id === replyAuthorId);
    if(!canDelete) { alert('⚠️ আপনি শুধু আপনার নিজের উত্তর ডিলিট করতে পারবেন!'); return; }
    if(confirm('উত্তরটি ডিলিট করতে চান?')) {
        await db.ref(`social_feed/${postId}/comments/${commentId}/replies/${replyId}`).remove();
        alert('✅ উত্তর ডিলিট করা হয়েছে!');
    }
};

window.toggleComments = (postId) => {
    const commentsDiv = document.getElementById(`comments_section_${postId}`);
    if(commentsDiv.style.display === 'none') {
        commentsDiv.style.display = 'block';
    } else {
        commentsDiv.style.display = 'none';
    }
};

function renderCommentTree(comments, postId, level = 0) {
    let html = '';
    for(let [commentId, comment] of Object.entries(comments)) {
        const showDelete = (currentUser.role === 'admin') || (currentUser.id === comment.authorId);
        const marginLeft = level * 40;
        
        html += `
            <div class="fb-comment" style="margin-left: ${marginLeft}px;">
                <div class="fb-comment-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="fb-comment-content">
                    <div class="fb-comment-author">${escapeHtml(comment.author)} 
                        <small>${comment.authorRole == 'admin' ? '🎓' : (comment.authorRole == 'teacher' ? '👨‍🏫' : '🧑‍🎓')}</small>
                    </div>
                    <div class="fb-comment-text">${escapeHtml(comment.text)}</div>
                    <div class="fb-comment-actions">
                        <span onclick="window.showReplyInput('${postId}', '${commentId}', '${escapeHtml(comment.author)}')">উত্তর</span>
                        ${showDelete ? `<span class="delete-comment" onclick="window.deleteComment('${postId}', '${commentId}', '${comment.authorId}')">মুছুন</span>` : ''}
                    </div>
                    <div id="reply_input_${postId}_${commentId}" style="display:none; margin-top: 10px;">
                        <div class="fb-comment-input-small">
                            <input type="text" id="reply_text_${postId}_${commentId}" placeholder="উত্তর লিখুন..." class="fb-comment-field">
                            <button class="fb-comment-send-small" onclick="window.addNestedComment('${postId}', '${commentId}', '${escapeHtml(comment.author)}')">পাঠান</button>
                            <button class="fb-comment-cancel" onclick="window.hideReplyInput('${postId}', '${commentId}')">বাতিল</button>
                        </div>
                    </div>
        `;
        
        if(comment.replies && Object.keys(comment.replies).length > 0) {
            html += renderCommentTree(comment.replies, postId, level + 1);
        }
        
        html += `</div></div>`;
    }
    return html;
}

function loadSocialFeed() {
    db.ref('social_feed').on('value', (snap) => {
        let container = document.getElementById('socialFeedContainer');
        container.innerHTML = '';
        let data = snap.val();
        if(!data) { 
            container.innerHTML = `
                <div class="empty-feed">
                    <i class="fas fa-newspaper" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>কোনো পোস্ট নেই</h3>
                    <p>প্রথম পোস্টটি করুন!</p>
                </div>
            `; 
            return; 
        }
        
        let sorted = Object.entries(data).sort((a,b)=>(b[1].timestamp||0)-(a[1].timestamp||0));
        
        for(let [pid, post] of sorted) {
            let reactions = post.reactions || { '👍': 0, '❤️': 0, '😢': 0, '😲': 0, '🥳': 0, '🔥': 0, '🤔': 0 };
            let userReaction = (post.userReactions || {})[currentUser.id];
            const showDelete = (currentUser.role === 'admin') || (currentUser.id === post.userId);
            
            let totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
            let topReaction = '';
            for(let [emoji, count] of Object.entries(reactions)) {
                if(count > 0) {
                    topReaction = emoji;
                    break;
                }
            }
            
            let totalComments = 0;
            if(post.comments) {
                const countComments = (comments) => {
                    let count = Object.keys(comments).length;
                    for(let [id, comment] of Object.entries(comments)) {
                        if(comment.replies) count += Object.keys(comment.replies).length;
                    }
                    return count;
                };
                totalComments = countComments(post.comments);
            }
            
            let reactionBar = `
                <div class="fb-reaction-bar">
                    <div class="fb-reaction-stats">
                        ${totalReactions > 0 ? `<span class="fb-reaction-icon">${topReaction}</span> <span>${totalReactions}</span>` : ''}
                    </div>
                    <div class="fb-comment-share-count">
                        ${totalComments} টি মন্তব্য
                    </div>
                </div>
                <div class="fb-action-buttons">
                    <button class="fb-action-btn ${userReaction ? 'active' : ''}" onclick="window.showReactionPicker('${pid}', this)">
                        <i class="fas fa-thumbs-up"></i> পছন্দ
                    </button>
                    <button class="fb-action-btn" onclick="window.toggleComments('${pid}')">
                        <i class="fas fa-comment"></i> মন্তব্য
                    </button>
                    <button class="fb-action-btn">
                        <i class="fas fa-share"></i> শেয়ার
                    </button>
                </div>
                <div class="reaction-picker" id="reactionPicker_${pid}" style="display:none;">
                    <button onclick="window.addReaction('${pid}', '👍')">👍</button>
                    <button onclick="window.addReaction('${pid}', '❤️')">❤️</button>
                    <button onclick="window.addReaction('${pid}', '😢')">😢</button>
                    <button onclick="window.addReaction('${pid}', '😲')">😲</button>
                    <button onclick="window.addReaction('${pid}', '🥳')">🥳</button>
                    <button onclick="window.addReaction('${pid}', '🔥')">🔥</button>
                    <button onclick="window.addReaction('${pid}', '🤔')">🤔</button>
                </div>
            `;
            
            let commentsHtml = '';
            if(post.comments && Object.keys(post.comments).length > 0) {
                commentsHtml = `<div class="fb-comments-list">${renderCommentTree(post.comments, pid)}</div>`;
            }
            
            let mediaHtml = '';
            if(post.media && post.media.length > 0) {
                if(post.media.length === 1) {
                    const mediaItem = post.media[0];
                    if(mediaItem.type === 'image') {
                        mediaHtml = `<div class="fb-single-media"><img src="${mediaItem.data}" onclick="window.open(this.src)"></div>`;
                    } else if(mediaItem.type === 'video') {
                        mediaHtml = `<div class="fb-single-media"><video controls src="${mediaItem.data}"></video></div>`;
                    }
                } else {
                    const gridClass = post.media.length === 2 ? 'fb-grid-2' : (post.media.length === 3 ? 'fb-grid-3' : 'fb-grid-4');
                    mediaHtml = `<div class="fb-media-grid ${gridClass}">`;
                    for(let mediaItem of post.media) {
                        if(mediaItem.type === 'image') {
                            mediaHtml += `<div class="fb-media-item"><img src="${mediaItem.data}" onclick="window.open(this.src)"></div>`;
                        } else if(mediaItem.type === 'video') {
                            mediaHtml += `<div class="fb-media-item"><video controls src="${mediaItem.data}"></video></div>`;
                        }
                    }
                    mediaHtml += `</div>`;
                }
            } else if(post.imgUrl && (post.imgUrl.startsWith('data:image') || post.imgUrl.startsWith('http'))) {
                mediaHtml = `<div class="fb-single-media"><img src="${post.imgUrl}" onclick="window.open(this.src)"></div>`;
            }
            
            let card = document.createElement('div');
            card.className = 'fb-post-card';
            card.innerHTML = `
                <div class="fb-post-header">
                    <div class="fb-post-avatar">
                        <i class="fas ${post.authorRole == 'admin' ? 'fa-crown' : (post.authorRole == 'teacher' ? 'fa-chalkboard-user' : 'fa-user-graduate')}"></i>
                    </div>
                    <div class="fb-post-info">
                        <div class="fb-post-author">${escapeHtml(post.author)}</div>
                        <div class="fb-post-time">${post.timestamp ? new Date(post.timestamp).toLocaleString() : ''}</div>
                    </div>
                    ${showDelete ? `<button class="fb-post-menu" onclick="window.deletePost('${pid}', '${post.userId}')"><i class="fas fa-trash"></i></button>` : ''}
                </div>
                <div class="fb-post-caption">
                    <p>${escapeHtml(post.caption)}</p>
                </div>
                ${mediaHtml}
                ${reactionBar}
                <div class="fb-comments-section" id="comments_section_${pid}" style="display:none;">
                    ${commentsHtml}
                    <div class="fb-comment-input">
                        <div class="fb-comment-avatar-small">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <input type="text" id="comment_input_${pid}" placeholder="মন্তব্য লিখুন..." class="fb-comment-field">
                        <button class="fb-comment-send" onclick="window.addComment('${pid}')">পাঠান</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

// Add Facebook-like CSS with nested comment support
const fbStyle = document.createElement('style');
fbStyle.textContent = `
    .fb-post-card {
        background: white;
        border-radius: 12px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        overflow: hidden;
    }
    .fb-post-header {
        display: flex;
        padding: 12px 16px;
        align-items: center;
        gap: 12px;
    }
    .fb-post-avatar {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #1877f2, #0e5a9e);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    .fb-post-avatar i {
        font-size: 20px;
    }
    .fb-post-info {
        flex: 1;
    }
    .fb-post-author {
        font-weight: 600;
        color: #050505;
    }
    .fb-post-time {
        font-size: 12px;
        color: #65676b;
    }
    .fb-post-menu {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #65676b;
        padding: 8px;
        border-radius: 50%;
    }
    .fb-post-menu:hover {
        background: #f0f2f5;
    }
    .fb-post-caption {
        padding: 0 16px 12px 16px;
        font-size: 14px;
        color: #050505;
    }
    .fb-single-media {
        background: #f0f2f5;
    }
    .fb-single-media img, .fb-single-media video {
        width: 100%;
        max-height: 500px;
        object-fit: contain;
    }
    .fb-media-grid {
        display: grid;
        gap: 2px;
        background: #f0f2f5;
    }
    .fb-grid-2 {
        grid-template-columns: 1fr 1fr;
    }
    .fb-grid-3 {
        grid-template-columns: repeat(3, 1fr);
    }
    .fb-grid-4 {
        grid-template-columns: repeat(2, 1fr);
    }
    .fb-media-item img, .fb-media-item video {
        width: 100%;
        height: 250px;
        object-fit: cover;
    }
    .fb-reaction-bar {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        border-top: 1px solid #e4e6eb;
        border-bottom: 1px solid #e4e6eb;
        font-size: 13px;
        color: #65676b;
    }
    .fb-reaction-stats {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .fb-reaction-icon {
        font-size: 14px;
    }
    .fb-action-buttons {
        display: flex;
        padding: 4px;
        gap: 4px;
    }
    .fb-action-btn {
        flex: 1;
        background: none;
        border: none;
        padding: 8px;
        border-radius: 8px;
        font-weight: 600;
        color: #65676b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    .fb-action-btn:hover {
        background: #f0f2f5;
    }
    .fb-action-btn.active {
        color: #1877f2;
    }
    .reaction-picker {
        position: fixed;
        background: white;
        border-radius: 40px;
        padding: 8px 12px;
        display: flex;
        gap: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        z-index: 1000;
    }
    .reaction-picker button {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .reaction-picker button:hover {
        transform: scale(1.2);
    }
    .fb-comments-section {
        padding: 0 16px 12px 16px;
        border-top: 1px solid #e4e6eb;
    }
    .fb-comments-list {
        margin: 12px 0;
        max-height: 400px;
        overflow-y: auto;
    }
    .fb-comment {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
    }
    .fb-comment-avatar {
        width: 32px;
        height: 32px;
        background: #e4e6eb;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #65676b;
        flex-shrink: 0;
    }
    .fb-comment-content {
        flex: 1;
        background: #f0f2f5;
        padding: 8px 12px;
        border-radius: 18px;
    }
    .fb-comment-author {
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 4px;
    }
    .fb-comment-text {
        font-size: 13px;
        color: #050505;
    }
    .fb-comment-actions {
        font-size: 11px;
        color: #65676b;
        margin-top: 4px;
        display: flex;
        gap: 12px;
    }
    .fb-comment-actions span {
        cursor: pointer;
    }
    .fb-comment-actions span:hover {
        text-decoration: underline;
    }
    .delete-comment {
        color: #e74c3c;
    }
    .fb-comment-input {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
    }
    .fb-comment-input-small {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
    }
    .fb-comment-avatar-small {
        width: 28px;
        height: 28px;
        background: #e4e6eb;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .fb-comment-field {
        flex: 1;
        background: #f0f2f5;
        border: none;
        border-radius: 20px;
        padding: 8px 12px;
        font-size: 13px;
    }
    .fb-comment-field:focus {
        outline: none;
    }
    .fb-comment-send, .fb-comment-send-small {
        background: #1877f2;
        color: white;
        border: none;
        padding: 6px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 600;
    }
    .fb-comment-cancel {
        background: #e4e6eb;
        color: #65676b;
        border: none;
        padding: 6px 12px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 12px;
    }
    .empty-feed {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 12px;
    }
`;
document.head.appendChild(fbStyle);

window.deleteTeacher = async (id) => { if(confirm('শিক্ষক মুছবেন?')){ await db.ref(`registered_teachers/${id}`).remove(); loadTeachersTableView(); loadDashboard(); } };
window.deleteFeedback = async (classKey, studentId, teacherId) => {
    if(confirm('এই মতামতটি মুছতে চান?')) {
        await db.ref(`secret_evaluations/${classKey}/${studentId}/${teacherId}`).remove();
        loadFeedbackArchive();
        alert('মতামত মুছে ফেলা হয়েছে!');
    }
};

async function loadTeachersTableView() {
    const snap = await db.ref('registered_teachers').get();
    const container = document.getElementById('teachersTable');
    if(!snap.exists()) { container.innerHTML = '<div class="empty-state">কোন শিক্ষক নেই</div>'; return; }
    let html = `<table class="teacher-table"><thead><tr><th>ছবি</th><th>নাম</th><th>আইডি</th><th>ক্লাস</th><th>অ্যাকশন</th></tr></thead><tbody>`;
    for(let key in snap.val()) {
        let t = snap.val()[key];
        let photo = t.photo ? `<img src="${t.photo}" style="width:40px;height:40px;border-radius:50%;">` : `<i class="fas fa-user-circle"></i>`;
        html += `<tr><td>${photo}</td><td>${escapeHtml(t.teacher_name)}</td><td>${t.teacher_id}</td><td>${t.classes?.join(', ') || '—'}</td><td><button class="btn btn-red btn-sm" onclick="window.deleteTeacher('${t.teacher_id}')">মুছুন</button></td></tr>`;
    }
    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function loadFeedbackArchive() {
    if(currentUser.role !== 'admin') return;
    const filter = document.getElementById('feedbackClassFilter')?.value || '';
    const snap = await db.ref('secret_evaluations').get();
    if(!snap.exists()) { document.getElementById('feedbackList').innerHTML='<div class="empty-state">কোন ফিডব্যাক নেই</div>'; return; }
    let items = [];
    for(let classKey in snap.val()) {
        let className = classKey.replace(/_/g, ' ');
        if(filter && className !== filter) continue;
        for(let student in snap.val()[classKey]) {
            for(let teacher in snap.val()[classKey][student]) {
                items.push({ class: className, classKey, studentId: student, teacherId: teacher, ...snap.val()[classKey][student][teacher] });
            }
        }
    }
    if(!items.length) { document.getElementById('feedbackList').innerHTML='<div class="empty-state">কোন ফিডব্যাক নেই</div>'; return; }
    let html = '';
    items.forEach(it => {
        html += `<div class="feedback-item"><strong>📚 ${it.class}</strong> | 👨‍🎓 ${escapeHtml(it.studentName)} | 👨‍🏫 ${escapeHtml(it.teacherName)}<button class="delete-btn" onclick="window.deleteFeedback('${it.classKey}', '${it.studentId}', '${it.teacherId}')"><i class="fas fa-trash"></i> মুছুন</button><br><small>📝 ${escapeHtml(it.comment)}</small><br><small>📅 ${new Date(it.timestamp).toLocaleDateString()}</small></div>`;
    });
    document.getElementById('feedbackList').innerHTML = html;
}

async function loadClassFilter() {
    if(currentUser.role !== 'admin') return;
    let sel = document.getElementById('feedbackClassFilter');
    if(sel) { sel.innerHTML = '<option value="">সব ক্লাস</option>' + classes.map(c=>`<option value="${c}">${c}</option>`).join(''); sel.onchange = loadFeedbackArchive; await loadFeedbackArchive(); }
}

let currentManageClass = "Class 5";

function loadClassButtons() {
    let cont = document.getElementById('classButtons');
    if(!cont) return;
    cont.innerHTML = '';
    for(let c of classes) {
        let btn = document.createElement('div');
        btn.className = 'class-btn';
        btn.innerHTML = `📖 ${c}`;
        btn.onclick = () => {
            document.querySelectorAll('.class-btn').forEach(b => b.style.background = '#eef2f5');
            btn.style.background = '#f5b042';
            btn.style.color = '#0a163b';
            currentManageClass = c;
            document.getElementById('selectedClassName').innerHTML = currentManageClass;
            loadClassData(currentManageClass);
        };
        cont.appendChild(btn);
    }
    document.getElementById('selectedClassName').innerHTML = currentManageClass;
    loadClassData(currentManageClass);
}

async function loadClassData(className) {
    const classKey = className.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
    const snap = await db.ref(`class_sheets/${classKey}/students`).get();
    studentsData = snap.exists() ? snap.val() : [];
    renderStudentsTable();
}

function renderStudentsTable() {
    let cont = document.getElementById('classStudentsTable');
    if(!cont) return;
    if(!studentsData.length) { cont.innerHTML='<div class="empty-state">কোন ছাত্র/ছাত্রী নেই। উপরে ফর্ম ব্যবহার করে যোগ করুন।</div>'; return; }
    let html = `<table class="student-table"><thead><tr><th>ছবি</th><th>ক্রমিক</th><th>আইডি</th><th>নাম</th><th>পাসওয়ার্ড</th><th>অভিভাবকের মোবাইল</th><th>অ্যাকশন</th></tr></thead><tbody>`;
    studentsData.forEach((s,i) => {
        let studentPhoto = s.photo ? `<img src="${s.photo}" style="width:35px;height:35px;border-radius:50%;">` : `<i class="fas fa-user-circle"></i>`;
        html += `<tr>
                     <td>${studentPhoto}</td>
                     <td>${i+1}</td>
                     <td>${escapeHtml(s.id)}</td>
                     <td><input type="text" class="editName" data-index="${i}" value="${escapeHtml(s.name)}"></td>
                     <td><input type="text" class="editPass" data-index="${i}" value="${escapeHtml(s.password)}"></td>
                     <td><input type="tel" class="editPhone" data-index="${i}" value="${escapeHtml(s.guardian_phone || '')}" placeholder="+8801XXXXXXXXX"></td>
                     <td><button class="btn btn-red btn-sm" onclick="window.removeStudent(${i})">মুছুন</button></td>
                 </tr>`;
    });
    html += `</tbody></table>`;
    cont.innerHTML = html;
    document.querySelectorAll('.editName').forEach(inp => inp.onchange = (e) => studentsData[inp.dataset.index].name = inp.value);
    document.querySelectorAll('.editPass').forEach(inp => inp.onchange = (e) => studentsData[inp.dataset.index].password = inp.value);
    document.querySelectorAll('.editPhone').forEach(inp => inp.onchange = (e) => studentsData[inp.dataset.index].guardian_phone = inp.value);
}

window.removeStudent = (idx) => { studentsData.splice(idx,1); renderStudentsTable(); };

document.getElementById('addCousinBtn').onclick = () => {
    let name = document.getElementById('cousinName').value.trim();
    let id = document.getElementById('cousinId').value.trim().toLowerCase();
    let pwd = document.getElementById('cousinPass').value.trim();
    let guardianPhone = document.getElementById('cousinGuardianPhone').value.trim();
    if(!name || !id || !pwd) { alert('নাম, আইডি এবং পাসওয়ার্ড আবশ্যক!'); return; }
    if(studentsData.find(s=>s.id===id)) { alert('এই আইডি ইতিমধ্যে বিদ্যমান!'); return; }
    studentsData.push({ id, name, password: pwd, photo: studentImageBase64 || '', guardian_phone: guardianPhone || '' });
    studentImageBase64 = '';
    document.getElementById('studentImagePreview').src = 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=ছাত্র';
    document.getElementById('cousinName').value = '';
    document.getElementById('cousinId').value = '';
    document.getElementById('cousinPass').value = '';
    document.getElementById('cousinGuardianPhone').value = '';
    renderStudentsTable();
};

document.getElementById('saveClassBtn').onclick = async () => { 
    const classKey = currentManageClass.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
    await db.ref(`class_sheets/${classKey}`).set({ students: studentsData }); 
    alert('ছাত্র/ছাত্রী তথ্য সংরক্ষিত!'); 
};

document.getElementById('teacherImageInput')?.addEventListener('change', e => { const file = e.target.files[0]; if(file) { const reader = new FileReader(); reader.onload = ev => { teacherImageBase64 = ev.target.result; document.getElementById('teacherImagePreview').src = ev.target.result; }; reader.readAsDataURL(file); } });

document.getElementById('studentImageInput')?.addEventListener('change', e => { const file = e.target.files[0]; if(file) { const reader = new FileReader(); reader.onload = ev => { studentImageBase64 = ev.target.result; document.getElementById('studentImagePreview').src = ev.target.result; }; reader.readAsDataURL(file); } });

document.getElementById('createTeacherBtn').onclick = async() => {
    const name = document.getElementById('newTeacherName').value.trim();
    const id = document.getElementById('newTeacherId').value.trim().toLowerCase();
    const pwd = document.getElementById('newTeacherPass').value.trim();
    if(!name || !id || !pwd) { alert('নাম, আইডি এবং পাসওয়ার্ড আবশ্যক!'); return; }
    const selected = [];
    document.querySelectorAll('.teacherClassCheckbox:checked').forEach(cb => selected.push(cb.value));
    await db.ref(`registered_teachers/${id}`).set({ teacher_name: name, teacher_id: id, password: pwd, classes: selected, photo: teacherImageBase64 || '' });
    alert('শিক্ষক তৈরি সফল!');
    teacherImageBase64 = '';
    document.getElementById('newTeacherName').value = '';
    document.getElementById('newTeacherId').value = '';
    document.getElementById('newTeacherPass').value = '';
    loadTeachersTableView();
    loadDashboard();
};

function loadClassCheckboxes() {
    let container = document.getElementById('classCheckboxes');
    if(container) {
        container.innerHTML = '';
        for(let c of classes) {
            let label = document.createElement('label');
            label.style.cssText = "display:inline-block; margin:5px;";
            label.innerHTML = `<input type="checkbox" value="${c}" class="teacherClassCheckbox"> ${c}`;
            container.appendChild(label);
        }
    }
}

async function loadRoutineEditForm() {
    const routine = await loadRoutineFromFirebase();
    let html = '';
    for(let cls of classes) {
        let clsRoutine = routine[cls] || {};
        html += `<div style="background:#f9f5ed; border-radius:20px; padding:16px; margin-bottom:20px;"><h3>${cls}</h3><table class="routine-table"><thead><tr><th>দিন</th><th>বিষয়</th><th>অ্যাকশন</th></tr></thead><tbody>`;
        days.forEach((day, idx) => {
            html += `<tr><td>${day}</td><td><input type="text" id="input_${cls.replace(/\s/g,'_').replace(/\(/g,'').replace(/\)/g,'')}_${idx}" value="${escapeHtml(clsRoutine[day] || '')}" style="width:100%;"></td><td><button class="btn btn-orange btn-sm" onclick="window.updateRoutineDay('${cls}', '${day}', ${idx})">আপডেট</button></td></tr>`;
        });
        html += `</tbody></table></div>`;
    }
    document.getElementById('routineEditArea').innerHTML = html;
}

window.updateRoutineDay = async (className, day, idx) => {
    const inputId = `input_${className.replace(/\s/g,'_').replace(/\(/g,'').replace(/\)/g,'')}_${idx}`;
    const newSubject = document.getElementById(inputId).value.trim();
    if(!newSubject) { alert('বিষয়ের নাম লিখুন'); return; }
    const routine = await loadRoutineFromFirebase();
    if(!routine[className]) routine[className] = {};
    routine[className][day] = newSubject;
    await db.ref('class_routines').set(routine);
    alert(`${className} এর ${day} এর রুটিন আপডেট করা হয়েছে!`);
    showTodayTomorrowRoutine();
};

async function showRoutine() {
    const routine = await loadRoutineFromFirebase();
    let routineHtml = '<h3>সাপ্তাহিক রুটিন</h3>';
    for(let cls of classes) {
        let clsRoutine = routine[cls] || routine["Class 5"];
        routineHtml += `<h4 style="margin-top:15px;">${cls}</h4><table class="routine-table"><thead><tr><th>দিন</th><th>বিষয়</th></tr></thead><tbody>`;
        days.forEach(day => { routineHtml += `<tr><td>${day}</td><td>${clsRoutine[day] || 'ক্লাস নেই'}</td></tr>`; });
        routineHtml += `</tbody></table>`;
    }
    document.getElementById('routineContent').innerHTML = routineHtml;
    document.getElementById('routineModal').style.display = 'flex';
}

document.getElementById('saveAllRoutinesBtn')?.addEventListener('click', async () => {
    const routine = await loadRoutineFromFirebase();
    for(let cls of classes) {
        if(!routine[cls]) routine[cls] = {};
        for(let i=0; i<days.length; i++) {
            const inputId = `input_${cls.replace(/\s/g,'_').replace(/\(/g,'').replace(/\)/g,'')}_${i}`;
            const input = document.getElementById(inputId);
            if(input) routine[cls][days[i]] = input.value.trim() || '';
        }
    }
    await db.ref('class_routines').set(routine);
    alert('সকল রুটিন সফলভাবে সংরক্ষিত হয়েছে!');
    showTodayTomorrowRoutine();
});

function setupMenu() {
    document.getElementById('menuDashboard').onclick = () => { showPanel('dashboardPanel'); if(currentUser.role === 'student') showTodayTomorrowRoutine(); else { loadDashboard(); showTodayTomorrowRoutine(); } };
    document.getElementById('menuClassManager').onclick = () => { if(currentUser.role === 'admin') { showPanel('adminClassPanel'); loadClassButtons(); } else alert('শুধু প্রশাসক'); };
    document.getElementById('menuTeachers').onclick = () => { if(currentUser.role === 'admin') { showPanel('adminTeachersPanel'); loadClassCheckboxes(); loadTeachersTableView(); } else alert('শুধু প্রশাসক'); };
    document.getElementById('menuAttendance').onclick = () => { showPanel('attendancePanel'); initAttendancePanel(); };
    document.getElementById('menuFeedback').onclick = () => { if(currentUser.role === 'admin') { showPanel('adminFeedbackPanel'); loadClassFilter(); } else alert('শুধু প্রশাসক'); };
    document.getElementById('menuRoutineManager').onclick = () => { if(currentUser.role === 'admin') { showPanel('adminRoutinePanel'); loadRoutineEditForm(); } else alert('শুধু প্রশাসক'); };
    document.getElementById('menuSocialFeed').onclick = () => showPanel('socialFeedPanel');
    document.getElementById('menuLogout').onclick = () => {
        localStorage.removeItem('userSession');
        location.reload();
    };
    document.getElementById('menuToggle').onclick = (e) => { e.stopPropagation(); document.getElementById('dropdownMenu').classList.toggle('show'); };
    document.addEventListener('click', () => document.getElementById('dropdownMenu').classList.remove('show'));
}

function hideAllPanels() { document.querySelectorAll('.panel').forEach(p => p.classList.remove('active', 'active-panel')); }
function showPanel(panelId) { hideAllPanels(); document.getElementById(panelId).classList.add('active-panel'); }

async function startApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    document.getElementById('userNameDisplay').innerText = currentUser.name;
    document.getElementById('roleDisplay').innerText = currentUser.role == 'admin' ? 'প্রশাসক' : (currentUser.role == 'teacher' ? 'শিক্ষক' : 'ছাত্র/ছাত্রী');
    
    let isAdmin = currentUser.role === 'admin';
    let isTeacher = currentUser.role === 'teacher';
    let isStudent = currentUser.role === 'student';
    
    document.getElementById('menuClassManager').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('menuTeachers').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('menuFeedback').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('menuRoutineManager').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('menuAttendance').style.display = 'block';
    
    const studentMenuItem = document.getElementById('menuStudentFeedback');
    if(isStudent) {
        studentMenuItem.style.display = 'block';
        studentMenuItem.onclick = () => { showPanel('studentPanel'); loadStudentFeedback(); };
    } else { studentMenuItem.style.display = 'none'; }
    
    await loadDashboard();
    loadSocialFeed();
    await loadRoutineFromFirebase();
    await showTodayTomorrowRoutine();
    
    // ====== NAVBAR BUTTONS ======
    document.getElementById('aboutUsBtnNav')?.addEventListener('click', () => {
        document.getElementById('aboutModal').style.display = 'flex';
    });

    document.getElementById('viewRoutineBtnNav')?.addEventListener('click', () => {
        document.getElementById('routineModal').style.display = 'flex';
        showRoutine();
    });

    document.getElementById('viewResultBtnNav')?.addEventListener('click', () => {
        document.getElementById('resultModal').style.display = 'flex';
    });
    
    // Dashboard panel buttons (if they exist)
    document.getElementById('aboutUsBtn')?.addEventListener('click', () => {
        document.getElementById('aboutModal').style.display = 'flex';
    });

    document.getElementById('viewRoutineBtn')?.addEventListener('click', () => {
        document.getElementById('routineModal').style.display = 'flex';
        showRoutine();
    });
    
    if(isStudent) {
        const studentInfoDiv = document.getElementById('studentClassInfo');
        if(studentInfoDiv) {
            studentInfoDiv.style.display = 'block';
            document.getElementById('studentNameDisplay').innerText = currentUser.name;
            document.getElementById('studentClassDisplay').innerText = currentClass;
            document.getElementById('studentIdDisplay').innerText = currentUser.id;
        }
        showPanel('dashboardPanel');
    } else if(isTeacher) {
        await loadTeacherPanel();
        showPanel('teacherPanel');
    } else {
        await loadDashboard();
        await loadTeachersTableView();
        showPanel('dashboardPanel');
    }
    setupMenu();
}

// Session check on page load
window.addEventListener('DOMContentLoaded', async () => {
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            if (session.role === 'admin') {
                currentUser = session;
                startApp();
            } else if (session.role === 'teacher') {
                const snap = await db.ref(`registered_teachers/${session.id}`).get();
                if (snap.exists()) {
                    currentUser = session;
                    teacherAssignedClasses = snap.val().classes || [];
                    startApp();
                } else {
                    localStorage.removeItem('userSession');
                    document.getElementById('loginScreen').style.display = 'flex';
                    document.getElementById('appContainer').style.display = 'none';
                }
            } else if (session.role === 'student') {
                const classKey = session.className?.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
                const snap = await db.ref(`class_sheets/${classKey}/students`).get();
                if (snap.exists() && snap.val().find(s => s.id === session.id)) {
                    currentUser = session;
                    currentClass = session.className;
                    startApp();
                } else {
                    localStorage.removeItem('userSession');
                    document.getElementById('loginScreen').style.display = 'flex';
                    document.getElementById('appContainer').style.display = 'none';
                }
            }
        } catch(e) {
            localStorage.removeItem('userSession');
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appContainer').style.display = 'none';
        }
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
    }
});

const slides = document.querySelectorAll('.bg-slide');
let currentBgSlide = 0;
if(slides.length) {
    slides[0].classList.add('active');
    setInterval(() => {
        slides[currentBgSlide].classList.remove('active');
        currentBgSlide = (currentBgSlide + 1) % slides.length;
        slides[currentBgSlide].classList.add('active');
    }, 5000);
}

document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    let role = document.getElementById('loginRole').value;
    let id = document.getElementById('loginId').value.trim().toLowerCase();
    let pwd = document.getElementById('loginPassword').value.trim();
    
    if(role === 'admin') {
        if(id === 'admin' && pwd === '#$t') {
            currentUser = { id, role: 'admin', name: 'প্রশাসক', photo: '' };
            localStorage.setItem('userSession', JSON.stringify(currentUser));
            startApp();
        } else alert('অ্যাডমিন আইডি বা পাসওয়ার্ড ভুল!');
    } else if(role === 'teacher') {
        let snap = await db.ref(`registered_teachers/${id}`).get();
        if(snap.exists() && snap.val().password === pwd) {
            currentUser = { id, role: 'teacher', name: snap.val().teacher_name, photo: snap.val().photo || '' };
            teacherAssignedClasses = snap.val().classes || [];
            localStorage.setItem('userSession', JSON.stringify(currentUser));
            startApp();
        } else alert('শিক্ষক আইডি বা পাসওয়ার্ড ভুল!');
    } else {
        let found = false;
        for(let cls of classes) {
            const classKey = cls.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
            let snap = await db.ref(`class_sheets/${classKey}/students`).get();
            if(snap.exists()) {
                let match = snap.val().find(s => s.id === id && s.password === pwd);
                if(match) {
                    currentUser = { id, role: 'student', name: match.name, photo: match.photo || '', className: cls };
                    currentClass = cls;
                    localStorage.setItem('userSession', JSON.stringify({ ...currentUser, className: cls }));
                    found = true;
                    break;
                }
            }
        }
        if(found) startApp();
        else alert('ছাত্র আইডি বা পাসওয়ার্ড ভুল!');
    }
};

async function initDemoData() {
    const teachersSnap = await db.ref('registered_teachers').get();
    if(!teachersSnap.exists()) {
        await db.ref('registered_teachers/teacher1').set({
            teacher_name: 'জন প্রধান শিক্ষক', teacher_id: 'teacher1', password: '1234',
            classes: ['Class 6', 'Class 7'], photo: ''
        });
        await db.ref('registered_teachers/teacher2').set({
            teacher_name: 'মেরি স্যার', teacher_id: 'teacher2', password: '1234',
            classes: ['Class 8', 'Class 9 (Science)'], photo: ''
        });
    }
    for(let cls of classes) {
        const classKey = cls.replace(/\s+/g,'_').replace(/\(/g,'').replace(/\)/g,'');
        const classSnap = await db.ref(`class_sheets/${classKey}/students`).get();
        if(!classSnap.exists() && cls === 'Class 6') {
            await db.ref(`class_sheets/Class_6/students`).set([
                { id: 'student1', name: 'রহিম উদ্দিন', password: '1234', guardian_phone: '+8801889343480', photo: '' },
                { id: 'student2', name: 'করিমা বেগম', password: '1234', guardian_phone: '+8801889343481', photo: '' }
            ]);
        }
    }
}
initDemoData();

setTimeout(async () => {
    const isActive = await checkSMSService();
    if (isActive) console.log("✅ SMS Service is active!");
    else console.log("⚠️ SMS Service not responding.");
}, 3000);

document.addEventListener('DOMContentLoaded', function() {
    setupMediaPreview();
});
