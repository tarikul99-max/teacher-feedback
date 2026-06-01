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

let currentUser = { id: "", role: "", name: "", photo: "" };
let currentClass = "Class 6";
let studentsData = [];
let teacherAssignedClasses = [];
let classRoutine = {};
let teacherImageBase64 = "", studentImageBase64 = "";
let currentStudentsList = [];

const classes = ["Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const days = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];
const SMS_API_URL = "https://selfsms.onrender.com/api";

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]); }

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

async function sendAbsentSMS(phoneNumber, studentName, className, date) {
    if (!phoneNumber || phoneNumber.length !== 11 || !phoneNumber.startsWith('01')) return false;
    try {
        const response = await fetch(`${SMS_API_URL}/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneNumber, studentName: studentName, className: className, date: date })
        });
        const result = await response.json();
        return result.success === true;
    } catch (error) { return false; }
}

const defaultRoutine = {
    "Class 5": { "শনিবার": "গণিত", "রবিবার": "বাংলা", "সোমবার": "ইংরেজি", "মঙ্গলবার": "বিজ্ঞান", "বুধবার": "সামাজিক", "বৃহস্পতিবার": "ধর্ম", "শুক্রবার": "ছুটি" },
    "Class 6": { "শনিবার": "বিজ্ঞান", "রবিবার": "গণিত", "সোমবার": "বাংলা", "মঙ্গলবার": "ইংরেজি", "বুধবার": "কম্পিউটার", "বৃহস্পতিবার": "সাধারণ জ্ঞান", "শুক্রবার": "ছুটি" },
    "Class 7": { "শনিবার": "ইংরেজি", "রবিবার": "বিজ্ঞান", "সোমবার": "গণিত", "মঙ্গলবার": "বাংলা", "বুধবার": "সামাজিক", "বৃহস্পতিবার": "ধর্ম", "শুক্রবার": "ছুটি" },
    "Class 8": { "শনিবার": "বাংলা", "রবিবার": "ইংরেজি", "সোমবার": "গণিত", "মঙ্গলবার": "বিজ্ঞান", "বুধবার": "কৃষি", "বৃহস্পতিবার": "কম্পিউটার", "শুক্রবার": "ছুটি" },
    "Class 9": { "শনিবার": "পদার্থবিজ্ঞান", "রবিবার": "রসায়ন", "সোমবার": "জীববিজ্ঞান", "মঙ্গলবার": "উচ্চতর গণিত", "বুধবার": "বাংলা", "বৃহস্পতিবার": "ইংরেজি", "শুক্রবার": "ছুটি" },
    "Class 10": { "শনিবার": "রসায়ন", "রবিবার": "পদার্থবিজ্ঞান", "সোমবার": "জীববিজ্ঞান", "মঙ্গলবার": "উচ্চতর গণিত", "বুধবার": "ইংরেজি", "বৃহস্পতিবার": "বাংলা", "শুক্রবার": "ছুটি" }
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
        let clsRoutine = routine[currentClass] || routine["Class 6"];
        container.innerHTML = `
            <div class="today-routine-card">
                <h3>📚 আজকের ক্লাস (${todayName})</h3>
                <div class="routine-subject">${clsRoutine[todayName] || 'ক্লাস নেই'}</div>
                <p style="margin-top:10px;">আপনার ক্লাস: ${currentClass}</p>
            </div>
            <div class="tomorrow-routine-card">
                <h3>📚 আগামীকালের ক্লাস (${tomorrowName})</h3>
                <div class="routine-subject">${clsRoutine[tomorrowName] || 'ক্লাস নেই'}</div>
            </div>
        `;
    } else {
        let todayHtml = `<div class="today-routine-card"><h3>📚 আজকের ক্লাস (${todayName})</h3>`;
        let tomorrowHtml = `<div class="tomorrow-routine-card"><h3>📚 আগামীকালের ক্লাস (${tomorrowName})</h3>`;
        for(let cls of classes) {
            let clsRoutine = routine[cls] || routine["Class 6"];
            todayHtml += `<p><strong>${cls}:</strong> ${clsRoutine[todayName] || 'ক্লাস নেই'}</p>`;
            tomorrowHtml += `<p><strong>${cls}:</strong> ${clsRoutine[tomorrowName] || 'ক্লাস নেই'}</p>`;
        }
        todayHtml += `</div>`;
        tomorrowHtml += `</div>`;
        container.innerHTML = todayHtml + tomorrowHtml;
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
    const classKey = currentClass.replace(/\s+/g,'_');
    const studentId = currentUser.id;
    let year = 2025, month = new Date().getMonth();
    
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
            if(isPresent) { presentCount++; totalDays++; attendanceHtml += `<div class="cal-day present"><div class="date-num">${d}</div><div class="status-icon">✅ উপস্থিত</div></div>`; }
            else if(snap.exists() && snap.val() === false) { absentCount++; totalDays++; attendanceHtml += `<div class="cal-day absent"><div class="date-num">${d}</div><div class="status-icon">❌ অনুপস্থিত</div></div>`; }
            else attendanceHtml += `<div class="cal-day"><div class="date-num">${d}</div><div class="status-icon">—</div></div>`;
        }
        attendanceHtml += `</div>`;
        document.getElementById('studentCalendarGrid').innerHTML = attendanceHtml;
        let percentage = totalDays ? ((presentCount/totalDays)*100).toFixed(1) : 0;
        document.getElementById('studentSummary').innerHTML = `<div class="summary-item"><div class="number">${presentCount}</div><div>উপস্থিত</div></div><div class="summary-item"><div class="number">${absentCount}</div><div>অনুপস্থিত</div></div><div class="summary-item"><div class="number">${percentage}%</div><div>উপস্থিতির হার</div></div>`;
    };
    
    const months = ['জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    let selectorHtml = `<select id="studentMonthYearPicker">`;
    for(let y of [2025, 2026]) for(let m=0; m<12; m++) selectorHtml += `<option value="${y}-${m}" ${(y===2025 && m===month)?'selected':''}>${months[m]} ${y}</option>`;
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
    const classKey = className.replace(/\s+/g,'_');
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

// TEACHER CANNOT SEE ANY FEEDBACK - function removed
// No loadTeacherFeedback function exists anymore

async function loadStudentFeedback() {
    const area = document.getElementById('studentFeedbackArea');
    if(!area) return;
    const teachersSnap = await db.ref('registered_teachers').get();
    if(!teachersSnap.exists()) { area.innerHTML='<div class="empty-state">কোন শিক্ষক নেই</div>'; return; }
    const allTeachers = Object.values(teachersSnap.val());
    const classTeachers = allTeachers.filter(teacher => teacher.classes && teacher.classes.includes(currentClass));
    if(classTeachers.length === 0) { area.innerHTML='<div class="empty-state">আপনার ক্লাসের কোনো শিক্ষক নেই।</div>'; return; }
    const classKeyForDB = currentClass.replace(/\s+/g, '_');
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
    const classKey = className.replace(/\s+/g,'_');
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
    if(!className || !date) return;
    const classKey = className.replace(/\s+/g,'_');
    let attendanceData = {};
    currentStudentsList.forEach(s => { attendanceData[s.id] = s.present === true; });
    await db.ref(`attendances/${classKey}/${date}`).set(attendanceData);
    const absentStudents = currentStudentsList.filter(s => s.present !== true && s.guardian_phone);
    if(absentStudents.length > 0) {
        for(let student of absentStudents) {
            await sendAbsentSMS(student.guardian_phone, student.name, className, date);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        alert(`✅ উপস্থিতি সংরক্ষিত!\n📱 ${absentStudents.length} জন অভিভাবককে SMS পাঠানো হয়েছে`);
    } else { alert('✅ উপস্থিতি সংরক্ষিত হয়েছে!'); }
    await loadClassMonthlyCalendar();
}

async function loadClassMonthlyCalendar() {
    const className = document.getElementById('attendanceClassSelect').value;
    if(!className) return;
    const classKey = className.replace(/\s+/g,'_');
    const now = new Date();
    let year = now.getFullYear(), month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
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
    const monthSelector = `<select id="classMonthYearSelect"><option value="${year}-${month}" selected>${year} ${month+1}</option></select>`;
    document.getElementById('classMonthSelector').innerHTML = monthSelector;
    document.getElementById('classMonthlyCalendar').innerHTML = html;
}

// Social Feed Functions
window.publishPost = async () => {
    let cap = document.getElementById('feedCaption').value.trim();
    if(!cap) { alert('ক্যাপশন লিখুন'); return; }
    let author = currentUser.role === 'admin' ? '🎓 প্রশাসক' : (currentUser.role === 'teacher' ? `👨‍🏫 ${currentUser.name}` : `🧑‍🎓 ${currentUser.name}`);
    let img = document.getElementById('feedImgUrl').value.trim();
    await db.ref('social_feed').push({
        caption: cap, imgUrl: img, author, timestamp: Date.now(), userId: currentUser.id,
        reactions: { '👍': 0, '😢': 0, '😲': 0, '🥳': 0, '🔥': 0, '🤔': 0 }, userReactions: {}
    });
    document.getElementById('feedCaption').value = '';
    document.getElementById('feedImgUrl').value = '';
};

window.addReaction = async (postId, emoji) => {
    const postRef = db.ref(`social_feed/${postId}`);
    const snap = await postRef.get();
    if(snap.exists()) {
        const post = snap.val();
        let reactions = post.reactions || { '👍': 0, '😢': 0, '😲': 0, '🥳': 0, '🔥': 0, '🤔': 0 };
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

window.addReply = async (postId) => {
    const replyInput = document.getElementById(`reply_inp_${postId}`);
    const replyText = replyInput.value.trim();
    if(!replyText) { alert('মন্তব্য লিখুন'); return; }
    await db.ref(`social_feed/${postId}/replies`).push({
        text: replyText, author: currentUser.name, authorRole: currentUser.role, timestamp: Date.now()
    });
    replyInput.value = '';
};

function loadSocialFeed() {
    db.ref('social_feed').on('value', (snap) => {
        let container = document.getElementById('socialFeedContainer');
        container.innerHTML = '';
        let data = snap.val();
        if(!data) { container.innerHTML = '<div class="empty-state">কোনো পোস্ট নেই</div>'; return; }
        let sorted = Object.entries(data).sort((a,b)=>(b[1].timestamp||0)-(a[1].timestamp||0));
        for(let [pid, post] of sorted) {
            let reactions = post.reactions || { '👍': 0, '😢': 0, '😲': 0, '🥳': 0, '🔥': 0, '🤔': 0 };
            let userReaction = (post.userReactions || {})[currentUser.id];
            let repliesHtml = '';
            if(post.replies) {
                let repliesArr = Object.entries(post.replies).sort((a,b)=>(a[1].timestamp||0)-(b[1].timestamp||0));
                repliesHtml = '<div style="margin-top:10px; margin-left:20px; background:#f5f5f5; padding:10px; border-radius:16px;">';
                for(let [rid, reply] of repliesArr) {
                    repliesHtml += `<div style="margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:5px;"><strong>${escapeHtml(reply.author)}</strong> <small>${reply.authorRole == 'admin' ? '🎓' : (reply.authorRole == 'teacher' ? '👨‍🏫' : '🧑‍🎓')}</small><br><small>${escapeHtml(reply.text)}</small><br><small>${new Date(reply.timestamp).toLocaleString()}</small></div>`;
                }
                repliesHtml += '</div>';
            }
            let reactionBar = `<div class="reaction-bar">`;
            for(let [emoji, count] of Object.entries(reactions)) {
                let isActive = userReaction === emoji;
                reactionBar += `<button class="reaction-btn ${isActive ? 'active' : ''}" onclick="addReaction('${pid}', '${emoji}')">${emoji} <span class="reaction-count">${count}</span></button>`;
            }
            reactionBar += `</div>`;
            let card = document.createElement('div');
            card.className = 'social-card';
            card.innerHTML = `<div><b>${escapeHtml(post.author)}</b></div><small>${post.timestamp ? new Date(post.timestamp).toLocaleString() : ''}</small><p>${escapeHtml(post.caption)}</p>${post.imgUrl ? `<img src="${post.imgUrl}" style="max-width:100%; border-radius:16px;">` : ''}${reactionBar}${repliesHtml}<div style="display:flex; gap:8px; margin-top:10px;"><input type="text" id="reply_inp_${pid}" placeholder="মন্তব্য করুন..." style="flex:1;"><button class="btn btn-blue btn-sm" onclick="addReply('${pid}')">পাঠান</button></div>`;
            container.appendChild(card);
        }
    });
}

// Admin Functions - Only Admin can see and delete feedback
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
    let html = `</td><thead><tr><th>ছবি</th><th>নাম</th><th>আইডি</th><th>ক্লাস</th><th>অ্যাকশন</th></tr></thead><tbody>`;
    for(let key in snap.val()) {
        let t = snap.val()[key];
        let photo = t.photo ? `<img src="${t.photo}" style="width:40px;height:40px;border-radius:50%;">` : `<i class="fas fa-user-circle"></i>`;
        html += `<tr>
            <td>${photo}</td>
            <td>${escapeHtml(t.teacher_name)}</td>
            <td>${t.teacher_id}</td>
            <td>${t.classes?.join(', ') || '—'}</td>
            <td><button class="btn btn-red btn-sm" onclick="window.deleteTeacher('${t.teacher_id}')">মুছুন</button></td>
        </tr>`;
    }
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Only Admin can access feedback archive
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

// Class Management
let currentManageClass = "Class 6";

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
    const snap = await db.ref(`class_sheets/${className.replace(/\s+/g,'_')}/students`).get();
    studentsData = snap.exists() ? snap.val() : [];
    renderStudentsTable();
}

function renderStudentsTable() {
    let cont = document.getElementById('classStudentsTable');
    if(!cont) return;
    if(!studentsData.length) { cont.innerHTML='<div class="empty-state">কোন ছাত্র/ছাত্রী নেই। উপরে ফর্ম ব্যবহার করে যোগ করুন।</div>'; return; }
    let html = `<table><thead><tr><th>ছবি</th><th>#</th><th>আইডি</th><th>নাম</th><th>পাসওয়ার্ড</th><th>অভিভাবকের মোবাইল</th><th>একশন</th></tr></thead><tbody>`;
    studentsData.forEach((s,i) => {
        let studentPhoto = s.photo ? `<img src="${s.photo}" style="width:35px;height:35px;border-radius:50%;">` : `<i class="fas fa-user-circle"></i>`;
        html += `<tr>
            <td>${studentPhoto}</td>
            <td>${i+1}</td>
            <td>${escapeHtml(s.id)}</td>
            <td><input type="text" class="editName" data-index="${i}" value="${escapeHtml(s.name)}"></td>
            <td><input type="text" class="editPass" data-index="${i}" value="${escapeHtml(s.password)}"></td>
            <td><input type="tel" class="editPhone" data-index="${i}" value="${escapeHtml(s.guardian_phone || '')}" placeholder="01XXXXXXXXX"></td>
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
    document.getElementById('studentImagePreview').src = 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=Student';
    document.getElementById('cousinName').value = '';
    document.getElementById('cousinId').value = '';
    document.getElementById('cousinPass').value = '';
    document.getElementById('cousinGuardianPhone').value = '';
    renderStudentsTable();
};

document.getElementById('saveClassBtn').onclick = async () => { await db.ref(`class_sheets/${currentManageClass.replace(/\s+/g,'_')}`).set({ students: studentsData }); alert('ছাত্র/ছাত্রী তথ্য সংরক্ষিত!'); };

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

// Routine Edit
async function loadRoutineEditForm() {
    const routine = await loadRoutineFromFirebase();
    let html = '';
    for(let cls of classes) {
        let clsRoutine = routine[cls] || {};
        html += `<div style="background:#f9f5ed; border-radius:20px; padding:16px; margin-bottom:20px;"><h3>${cls}</h3><table class="routine-table"><thead><tr><th>দিন</th><th>বিষয়</th><th>একশন</th></tr></thead><tbody>`;
        days.forEach((day, idx) => {
            html += `<tr><td>${day}</td><td><input type="text" id="input_${cls.replace(/\s/g,'_')}_${idx}" value="${escapeHtml(clsRoutine[day] || '')}" style="width:100%;"></td><td><button class="btn btn-orange btn-sm" onclick="window.updateRoutineDay('${cls}', '${day}', ${idx})">আপডেট</button></td></tr>`;
        });
        html += `</tbody></table></div>`;
    }
    document.getElementById('routineEditArea').innerHTML = html;
}

window.updateRoutineDay = async (className, day, idx) => {
    const inputId = `input_${className.replace(/\s/g,'_')}_${idx}`;
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
        let clsRoutine = routine[cls] || routine["Class 6"];
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
            const inputId = `input_${cls.replace(/\s/g,'_')}_${i}`;
            const input = document.getElementById(inputId);
            if(input) routine[cls][days[i]] = input.value.trim() || '';
        }
    }
    await db.ref('class_routines').set(routine);
    alert('সকল রুটিন সফলভাবে সংরক্ষিত হয়েছে!');
    showTodayTomorrowRoutine();
});

// Menu and Navigation
function setupMenu() {
    document.getElementById('menuDashboard').onclick = () => { showPanel('dashboardPanel'); if(currentUser.role === 'student') showTodayTomorrowRoutine(); else { loadDashboard(); showTodayTomorrowRoutine(); } };
    document.getElementById('menuClassManager').onclick = () => { if(currentUser.role === 'admin') { showPanel('adminClassPanel'); loadClassButtons(); } else alert('শুধু প্রশাসক'); };
    document.getElementById('menuTeachers').onclick = () => { if(currentUser.role === 'admin') { showPanel('adminTeachersPanel'); loadClassCheckboxes(); loadTeachersTableView(); } else alert('শুধু প্রশাসক'); };
    document.getElementById('menuAttendance').onclick = () => { showPanel('attendancePanel'); initAttendancePanel(); };
    document.getElementById('menuFeedback').onclick = () => { if(currentUser.role === 'admin') { showPanel('adminFeedbackPanel'); loadClassFilter(); } else alert('শুধু প্রশাসক'); };
    document.getElementById('menuRoutineManager').onclick = () => { if(currentUser.role === 'admin') { showPanel('adminRoutinePanel'); loadRoutineEditForm(); } else alert('শুধু প্রশাসক'); };
    document.getElementById('menuSocialFeed').onclick = () => showPanel('socialFeedPanel');
    document.getElementById('menuLogout').onclick = () => location.reload();
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
        // Teacher cannot see feedback - removed
        showPanel('teacherPanel');
    } else {
        await loadDashboard();
        await loadTeachersTableView();
        showPanel('dashboardPanel');
    }
    setupMenu();
    document.getElementById('viewResultBtn')?.addEventListener('click', () => document.getElementById('resultModal').style.display = 'flex');
    document.getElementById('aboutUsBtn')?.addEventListener('click', () => document.getElementById('aboutModal').style.display = 'flex');
    document.getElementById('viewRoutineBtn')?.addEventListener('click', () => showRoutine());
}

// Background Slideshow
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

// Login
document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    let role = document.getElementById('loginRole').value;
    let id = document.getElementById('loginId').value.trim().toLowerCase();
    let pwd = document.getElementById('loginPassword').value.trim();
    
    if(role === 'admin') {
        if(id === 'admin' && pwd === '#$t') {
            currentUser = { id, role: 'admin', name: 'প্রশাসক', photo: '' };
            startApp();
        } else alert('অ্যাডমিন আইডি বা পাসওয়ার্ড ভুল!');
    } else if(role === 'teacher') {
        let snap = await db.ref(`registered_teachers/${id}`).get();
        if(snap.exists() && snap.val().password === pwd) {
            currentUser = { id, role: 'teacher', name: snap.val().teacher_name, photo: snap.val().photo || '' };
            teacherAssignedClasses = snap.val().classes || [];
            startApp();
        } else alert('শিক্ষক আইডি বা পাসওয়ার্ড ভুল!');
    } else {
        let found = false;
        for(let cls of classes) {
            let snap = await db.ref(`class_sheets/${cls.replace(/\s+/g,'_')}/students`).get();
            if(snap.exists()) {
                let match = snap.val().find(s => s.id === id && s.password === pwd);
                if(match) {
                    currentUser = { id, role: 'student', name: match.name, photo: match.photo || '' };
                    currentClass = cls;
                    found = true;
                    break;
                }
            }
        }
        if(found) startApp();
        else alert('ছাত্র আইডি বা পাসওয়ার্ড ভুল!');
    }
};

// Create demo data on first load
async function initDemoData() {
    const teachersSnap = await db.ref('registered_teachers').get();
    if(!teachersSnap.exists()) {
        await db.ref('registered_teachers/teacher1').set({
            teacher_name: 'জন প্রধান শিক্ষক', teacher_id: 'teacher1', password: '1234',
            classes: ['Class 6', 'Class 7'], photo: ''
        });
        await db.ref('registered_teachers/teacher2').set({
            teacher_name: 'মেরি স্যার', teacher_id: 'teacher2', password: '1234',
            classes: ['Class 8', 'Class 9'], photo: ''
        });
    }
    for(let cls of classes) {
        const classSnap = await db.ref(`class_sheets/${cls.replace(/\s+/g,'_')}/students`).get();
        if(!classSnap.exists() && cls === 'Class 6') {
            await db.ref(`class_sheets/Class_6/students`).set([
                { id: 'student1', name: 'রহিম উদ্দিন', password: '1234', guardian_phone: '01700000000', photo: '' },
                { id: 'student2', name: 'করিমা বেগম', password: '1234', guardian_phone: '01800000000', photo: '' }
            ]);
        }
    }
}
initDemoData();
