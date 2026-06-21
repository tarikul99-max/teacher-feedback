// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
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

// ============================================================
// GLOBAL VARIABLES
// ============================================================
let currentUserKey = null;
let currentUserName = null;
let currentRole = null;
let selectedClass = null;
let currentAttendanceDate = null;
let attendanceData = {};
let allStudents = {};
let allTeachers = {};
let allRoutines = {};
let allClasses = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'SSC Special'];
let feedData = {};
let feedbackData = {};
let studentMonthOffset = 0;
let classMonthOffset = 0;
let feedImages = [];
let selectedRoutineClass = null;
let selectedRoutineDay = 'Sunday';

// গ্রুপ লিস্ট - SSC Special বাদ
const GROUP_LIST = ['Science', 'Commerce', 'Arts'];
const GROUP_ICONS = {
    'Science': '🔬',
    'Commerce': '💼',
    'Arts': '🎨'
};

// গ্রুপ প্রয়োজন এমন ক্লাস - SSC Special বাদ
const GROUP_REQUIRED_CLASSES = ['Nine', 'Ten'];

// ============================================================
// SESSION MANAGEMENT
// ============================================================
function saveSession(user, role, name) {
    localStorage.setItem('mastermind_user', JSON.stringify({ user, role, name }));
}

function getSession() {
    try {
        const data = localStorage.getItem('mastermind_user');
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function clearSession() {
    localStorage.removeItem('mastermind_user');
}

// ============================================================
// DOM ELEMENTS
// ============================================================
const loginScreen = document.getElementById('loginScreen');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const loginId = document.getElementById('loginId');
const loginPassword = document.getElementById('loginPassword');
const loginRole = document.getElementById('loginRole');
const userNameDisplay = document.getElementById('userNameDisplay');
const roleDisplay = document.getElementById('roleDisplay');
const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');

// ============================================================
// BACKGROUND SLIDESHOW
// ============================================================
let slideIndex = 0;
const slides = document.querySelectorAll('.bg-slide');

function startSlideshow() {
    if (slides.length === 0) return;
    slides.forEach(s => s.classList.remove('active'));
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add('active');
    setTimeout(startSlideshow, 5000);
}

if (slides.length > 0) {
    slides[0].classList.add('active');
    setTimeout(startSlideshow, 5000);
}

// ============================================================
// MODAL FUNCTIONS
// ============================================================
function closeModalOutside(event, modalId) {
    const modal = document.getElementById(modalId);
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// ============================================================
// CHECK IF GROUP IS REQUIRED
// ============================================================
function isGroupRequired(className) {
    return GROUP_REQUIRED_CLASSES.includes(className);
}

// ============================================================
// GET GROUP DISPLAY NAME
// ============================================================
function getGroupDisplayName(group) {
    const icon = GROUP_ICONS[group] || '';
    return icon ? icon + ' ' + group : group;
}

// ============================================================
// TOGGLE GROUP FIELD VISIBILITY
// ============================================================
function toggleGroupField(className) {
    const groupContainer = document.getElementById('groupFieldContainer');
    const groupSelect = document.getElementById('cousinGroup');
    const requiredMsg = document.getElementById('groupRequiredMsg');
    
    if (!groupContainer || !groupSelect) return;
    
    if (isGroupRequired(className)) {
        groupSelect.required = true;
        if (requiredMsg) {
            requiredMsg.textContent = '⚠️ এই ক্লাসের জন্য গ্রুপ নির্বাচন আবশ্যক';
            requiredMsg.style.color = '#ffd700';
        }
    } else {
        groupSelect.required = false;
        groupSelect.value = '';
        if (requiredMsg) {
            requiredMsg.textContent = 'গ্রুপ নির্বাচন ঐচ্ছিক';
            requiredMsg.style.color = 'rgba(255,255,255,0.5)';
        }
    }
}

// ============================================================
// LOGIN SYSTEM
// ============================================================
function performLogin(id, password, role) {
    if (!id || !password) {
        alert('আইডি এবং পাসওয়ার্ড দিন');
        return false;
    }

    if (role === 'admin') {
        if (id === 'admin' && password === 'admin123') {
            currentUserKey = 'admin';
            currentUserName = 'পরিচালক';
            currentRole = 'admin';
            saveSession('admin', 'admin', 'পরিচালক');
            showApp();
            setupAdminUI();
            return true;
        } else {
            alert('ভুল আইডি বা পাসওয়ার্ড!');
            return false;
        }
    } else if (role === 'teacher') {
        const teacherRef = db.ref('teachers');
        teacherRef.once('value', (snapshot) => {
            const teachers = snapshot.val();
            let found = false;
            for (let key in teachers) {
                if (teachers[key].id === id && teachers[key].password === password) {
                    currentUserKey = key;
                    currentUserName = teachers[key].name;
                    currentRole = 'teacher';
                    saveSession(key, 'teacher', teachers[key].name);
                    showApp();
                    setupTeacherUI(teachers[key]);
                    found = true;
                    break;
                }
            }
            if (!found) {
                alert('ভুল আইডি বা পাসওয়ার্ড!');
            }
        });
        return true;
    } else if (role === 'student') {
        const studentRef = db.ref('students');
        studentRef.once('value', (snapshot) => {
            const students = snapshot.val();
            let found = false;
            for (let key in students) {
                if (students[key].id === id && students[key].password === password) {
                    currentUserKey = key;
                    currentUserName = students[key].name;
                    currentRole = 'student';
                    saveSession(key, 'student', students[key].name);
                    showApp();
                    setupStudentUI(students[key]);
                    found = true;
                    break;
                }
            }
            if (!found) {
                alert('ভুল আইডি বা পাসওয়ার্ড!');
            }
        });
        return true;
    }
    return false;
}

function checkSession() {
    const session = getSession();
    if (session) {
        const { user, role, name } = session;
        currentUserKey = user;
        currentUserName = name || user;
        currentRole = role;
        
        if (role === 'admin') {
            showApp();
            setupAdminUI();
        } else if (role === 'teacher') {
            db.ref('teachers/' + user).once('value', (snapshot) => {
                const teacherData = snapshot.val();
                if (teacherData) {
                    currentUserName = teacherData.name;
                    showApp();
                    setupTeacherUI(teacherData);
                } else {
                    clearSession();
                    loginScreen.style.display = 'flex';
                }
            });
        } else if (role === 'student') {
            db.ref('students/' + user).once('value', (snapshot) => {
                const studentData = snapshot.val();
                if (studentData) {
                    currentUserName = studentData.name;
                    showApp();
                    setupStudentUI(studentData);
                } else {
                    clearSession();
                    loginScreen.style.display = 'flex';
                }
            });
        }
        return true;
    }
    return false;
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = loginId.value.trim();
    const password = loginPassword.value.trim();
    const role = loginRole.value;
    performLogin(id, password, role);
});

function showApp() {
    loginScreen.style.display = 'none';
    appContainer.style.display = 'block';
    userNameDisplay.textContent = currentUserName || currentUserKey;
    roleDisplay.textContent = currentRole === 'admin' ? 'পরিচালক' : 
                             currentRole === 'teacher' ? 'শিক্ষক' : 'ছাত্র';
    loadAllData();
}

// ============================================================
// LOAD ALL DATA
// ============================================================
function loadAllData() {
    db.ref('teachers').on('value', (snapshot) => {
        allTeachers = snapshot.val() || {};
        renderTeachers();
        renderTeachersTable();
        renderTeacherGrid();
    });

    db.ref('students').on('value', (snapshot) => {
        allStudents = snapshot.val() || {};
        renderClassButtons();
        if (selectedClass) {
            renderClassStudents(selectedClass);
        }
        if (currentRole === 'student' && currentUserKey) {
            renderStudentInfo(allStudents[currentUserKey]);
        }
        if (currentRole === 'teacher' && allTeachers[currentUserKey]) {
            const classes = allTeachers[currentUserKey].classes || [];
            if (classes.length > 0) {
                renderTeacherClassStudents(classes[0]);
            }
        }
        populateAttendanceClassSelect();
        populateRoutineClassSelect();
    });

    db.ref('routines').on('value', (snapshot) => {
        allRoutines = snapshot.val() || {};
        renderTodayTomorrowRoutine();
        renderRoutineEditor();
        renderRoutineModal();
        renderStudentOwnRoutine();
    });

    db.ref('feed').on('value', (snapshot) => {
        feedData = snapshot.val() || {};
        renderSocialFeed();
    });

    db.ref('feedback').on('value', (snapshot) => {
        feedbackData = snapshot.val() || {};
        renderFeedbackList();
        renderStudentFeedbackArea();
    });

    db.ref('attendance').on('value', (snapshot) => {
        attendanceData = snapshot.val() || {};
        if (currentRole === 'student' && currentUserKey) {
            renderStudentAttendance();
        }
        if (currentRole === 'teacher') {
            renderClassMonthlyCalendar();
        }
    });
}

// ============================================================
// STUDENT OWN ROUTINE DISPLAY
// ============================================================
function renderStudentOwnRoutine() {
    const container = document.getElementById('studentRoutineDisplay');
    const parentContainer = document.getElementById('studentOwnRoutine');
    
    if (!container || !parentContainer) return;
    
    if (currentRole !== 'student' || !currentUserKey || !allStudents[currentUserKey]) {
        parentContainer.style.display = 'none';
        return;
    }
    
    const student = allStudents[currentUserKey];
    const className = student.class;
    const groupName = student.group || '';
    
    if (!className) {
        parentContainer.style.display = 'none';
        return;
    }
    
    parentContainer.style.display = 'block';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];
    const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const todayBangla = banglaDays[today.getDay()];
    
    let html = `<div style="margin-bottom:15px; display:flex; justify-content:space-between; flex-wrap:wrap; align-items:center;">
        <div>
            <p style="font-size:16px;"><strong>📚 ক্লাস:</strong> ${className === 'SSC Special' ? '<span class="ssc-special-badge">🎯 SSC Special</span>' : className} 
            ${groupName ? '| <span class="student-group-tag ' + groupName.toLowerCase() + '">' + GROUP_ICONS[groupName] + ' ' + groupName + '</span>' : ''}</p>
            <p style="font-size:14px; color:rgba(255,255,255,0.7);"><strong>📅 আজ:</strong> ${todayBangla} (${todayName})</p>
        </div>
        <div>
            <span style="background:#ffd700; color:#191970; padding:5px 15px; border-radius:20px; font-size:12px; font-weight:600;">
                <i class="fas fa-calendar-check"></i> আমার রুটিন
            </span>
        </div>
    </div>`;
    
    let routineKey = className;
    if (groupName && isGroupRequired(className)) {
        routineKey = className + '_' + groupName;
    }
    
    html += `<div class="table-responsive">
        <table class="routine-table" style="min-width:auto;">
            <thead>
                <tr>
                    <th style="width:40%;">দিন</th>
                    <th style="width:60%;">বিষয়</th>
                </tr>
            </thead>
            <tbody>`;
    
    let hasRoutine = false;
    days.forEach((day, index) => {
        let subject = '-';
        if (allRoutines[day] && allRoutines[day][routineKey]) {
            subject = allRoutines[day][routineKey];
            hasRoutine = true;
        }
        const isToday = day === todayName;
        const banglaDay = banglaDays[index];
        html += `<tr style="${isToday ? 'background:rgba(255,215,0,0.1); font-weight:bold;' : ''}">
            <td>${banglaDay} ${isToday ? ' 📌 (আজ)' : ''}</td>
            <td>${subject}</td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    
    if (!hasRoutine) {
        html += `<div style="text-align:center; padding:30px 0; color:rgba(255,255,255,0.5);">
            <i class="fas fa-calendar-times" style="font-size:40px; display:block; margin-bottom:10px; color:rgba(255,255,255,0.2);"></i>
            <p>আপনার জন্য এখনো কোনো রুটিন যোগ করা হয়নি।</p>
            <p style="font-size:12px;">অফিসে যোগাযোগ করুন রুটিন পেতে।</p>
        </div>`;
    } else {
        const todaySubject = allRoutines[todayName] && allRoutines[todayName][routineKey] ? allRoutines[todayName][routineKey] : null;
        if (todaySubject && todaySubject !== '-') {
            html += `<div style="margin-top:15px; padding:12px 18px; background:linear-gradient(135deg, #ffd700, #f5a623); border-radius:15px; color:#191970; text-align:center; font-weight:600;">
                <i class="fas fa-bell"></i> <strong>আজকের বিষয়:</strong> ${todaySubject}
            </div>`;
        }
    }
    
    container.innerHTML = html;
}

// ============================================================
// POPULATE SELECTS
// ============================================================
function populateAttendanceClassSelect() {
    const classSelect = document.getElementById('attendanceClassSelect');
    if (!classSelect) return;
    
    const selectedValue = classSelect.value;
    classSelect.innerHTML = '';
    allClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classSelect.appendChild(option);
    });
    if (selectedValue && allClasses.includes(selectedValue)) {
        classSelect.value = selectedValue;
    }
}

function populateRoutineClassSelect() {
    const classSelect = document.getElementById('routineClassSelect');
    if (!classSelect) return;
    
    const selectedValue = classSelect.value;
    classSelect.innerHTML = '';
    allClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classSelect.appendChild(option);
    });
    if (selectedValue && allClasses.includes(selectedValue)) {
        classSelect.value = selectedValue;
    }
    
    selectedRoutineClass = classSelect.value;
}

// ============================================================
// UI SETUP FUNCTIONS
// ============================================================
function setupAdminUI() {
    document.getElementById('menuClassManager').style.display = 'block';
    document.getElementById('menuTeachers').style.display = 'block';
    document.getElementById('menuFeedback').style.display = 'block';
    document.getElementById('menuRoutineManager').style.display = 'block';
    document.getElementById('menuStudentFeedback').style.display = 'none';
    showPanel('dashboardPanel');
    populateClassCheckboxes();
    populateFeedbackClassFilter();
    populateAttendanceClassSelect();
    populateRoutineClassSelect();
    setupAttendance();
    toggleGroupField(null);
}

function setupTeacherUI(teacherData) {
    document.getElementById('menuClassManager').style.display = 'none';
    document.getElementById('menuTeachers').style.display = 'none';
    document.getElementById('menuFeedback').style.display = 'none';
    document.getElementById('menuRoutineManager').style.display = 'none';
    document.getElementById('menuStudentFeedback').style.display = 'none';
    showPanel('dashboardPanel');
    renderTeacherProfile(teacherData);
    renderTeacherAssignedClasses(teacherData);
    populateAttendanceClassSelect();
    setupAttendance();
}

function setupStudentUI(studentData) {
    document.getElementById('menuClassManager').style.display = 'none';
    document.getElementById('menuTeachers').style.display = 'none';
    document.getElementById('menuFeedback').style.display = 'none';
    document.getElementById('menuRoutineManager').style.display = 'none';
    document.getElementById('menuStudentFeedback').style.display = 'block';
    showPanel('dashboardPanel');
    renderStudentInfo(studentData);
    setupAttendance();
}

// ============================================================
// PANEL NAVIGATION
// ============================================================
function showPanel(panelId) {
    document.querySelectorAll('.panel').forEach(p => {
        p.classList.remove('active-panel', 'active');
        p.style.display = 'none';
    });
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('active-panel');
        panel.style.display = 'block';
    }
}

// Menu navigation
document.getElementById('menuDashboard').addEventListener('click', () => {
    showPanel('dashboardPanel');
    dropdownMenu.classList.remove('show');
});

document.getElementById('menuClassManager').addEventListener('click', () => {
    showPanel('adminClassPanel');
    dropdownMenu.classList.remove('show');
});

document.getElementById('menuTeachers').addEventListener('click', () => {
    showPanel('adminTeachersPanel');
    dropdownMenu.classList.remove('show');
});

document.getElementById('menuAttendance').addEventListener('click', () => {
    showPanel('attendancePanel');
    dropdownMenu.classList.remove('show');
    populateAttendanceClassSelect();
    setupAttendance();
});

document.getElementById('menuFeedback').addEventListener('click', () => {
    showPanel('adminFeedbackPanel');
    dropdownMenu.classList.remove('show');
});

document.getElementById('menuRoutineManager').addEventListener('click', () => {
    showPanel('adminRoutinePanel');
    dropdownMenu.classList.remove('show');
    populateRoutineClassSelect();
    renderRoutineEditor();
});

document.getElementById('menuSocialFeed').addEventListener('click', () => {
    showPanel('socialFeedPanel');
    dropdownMenu.classList.remove('show');
});

document.getElementById('menuStudentFeedback').addEventListener('click', () => {
    showPanel('studentPanel');
    dropdownMenu.classList.remove('show');
});

document.getElementById('menuLogout').addEventListener('click', () => {
    if (confirm('আপনি কি লগআউট করতে চান?')) {
        clearSession();
        location.reload();
    }
    dropdownMenu.classList.remove('show');
});

menuToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        dropdownMenu.classList.remove('show');
    }
});

// ============================================================
// ROUTINE SELECT CHANGE
// ============================================================
document.getElementById('routineClassSelect')?.addEventListener('change', function() {
    selectedRoutineClass = this.value;
    renderRoutineEditor();
});

document.getElementById('routineDaySelect')?.addEventListener('change', function() {
    selectedRoutineDay = this.value;
    renderRoutineEditor();
});

document.getElementById('routineGroupSelect')?.addEventListener('change', function() {
    renderRoutineEditor();
});

// ============================================================
// TEACHER RENDERING
// ============================================================
function renderTeachers() {
    const grid = document.getElementById('teachersGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let key in allTeachers) {
        const teacher = allTeachers[key];
        const card = document.createElement('div');
        card.className = 'teacher-card';
        card.innerHTML = `
            <img src="${teacher.image || 'https://ui-avatars.com/api/?background=1e7b4a&color=fff&name=' + encodeURIComponent(teacher.name)}" alt="${teacher.name}">
            <h4>${teacher.name}</h4>
            <p style="font-size:13px;">আইডি: ${teacher.id}</p>
            <p style="font-size:12px; opacity:0.7;">${teacher.classes ? teacher.classes.join(', ') : ''}</p>
        `;
        grid.appendChild(card);
    }
}

function renderTeacherGrid() {
    renderTeachers();
}

function renderTeachersTable() {
    const container = document.getElementById('teachersTable');
    if (!container) return;
    if (Object.keys(allTeachers).length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5); text-align:center;">কোনো শিক্ষক নেই</p>';
        return;
    }
    let html = `<table><thead><tr><th>ছবি</th><th>নাম</th><th>আইডি</th><th>ক্লাস</th><th>অ্যাকশন</th></tr></thead><tbody>`;
    for (let key in allTeachers) {
        const t = allTeachers[key];
        html += `<tr>
            <td><img src="${t.image || 'https://ui-avatars.com/api/?background=1e7b4a&color=fff&name=' + encodeURIComponent(t.name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
            <td>${t.name}</td>
            <td>${t.id}</td>
            <td>${t.classes ? t.classes.join(', ') : ''}</td>
            <td><button class="btn btn-red btn-sm" onclick="deleteTeacher('${key}')">মুছুন</button></td>
        </tr>`;
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function deleteTeacher(key) {
    if (confirm('শিক্ষককে মুছতে চান?')) {
        db.ref('teachers/' + key).remove();
    }
}

// ============================================================
// STUDENT RENDERING
// ============================================================
function renderClassButtons() {
    const container = document.getElementById('classButtons');
    if (!container) return;
    container.innerHTML = '';
    allClasses.forEach(cls => {
        const btn = document.createElement('button');
        btn.className = 'class-btn' + (selectedClass === cls ? ' active' : '');
        btn.textContent = cls;
        btn.onclick = () => {
            selectedClass = cls;
            renderClassButtons();
            renderClassStudents(cls);
            document.getElementById('selectedClassName').textContent = cls;
            toggleGroupField(cls);
        };
        container.appendChild(btn);
    });
}

function renderClassStudents(className) {
    const container = document.getElementById('classStudentsTable');
    if (!container) return;
    const students = {};
    for (let key in allStudents) {
        if (allStudents[key].class === className) {
            students[key] = allStudents[key];
        }
    }
    if (Object.keys(students).length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5); text-align:center;">এই ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>';
        return;
    }
    let html = `<table><thead><tr><th>ছবি</th><th>নাম</th><th>আইডি</th><th>ক্লাস</th><th>গ্রুপ</th><th>অভিভাবকের মোবাইল</th><th>অ্যাকশন</th></tr></thead><tbody>`;
    for (let key in students) {
        const s = students[key];
        let groupBadge = '-';
        
        // SSC Special এর জন্য আলাদা ব্যাজ
        if (s.class === 'SSC Special') {
            groupBadge = `<span class="ssc-special-badge">🎯 এসএসসি স্পেশাল</span>`;
        } else if (s.group) {
            const icon = GROUP_ICONS[s.group] || '';
            groupBadge = `<span class="student-group-tag ${s.group.toLowerCase()}">${icon} ${s.group}</span>`;
        }
        
        html += `<tr>
            <td><img src="${s.image || 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=' + encodeURIComponent(s.name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
            <td>${s.name}</td>
            <td>${s.id}</td>
            <td>${s.class === 'SSC Special' ? '<span class="ssc-special-badge">🎯 SSC Special</span>' : s.class}</td>
            <td>${groupBadge}</td>
            <td>${s.guardianPhone || ''}</td>
            <td><button class="btn btn-red btn-sm" onclick="deleteStudent('${key}')">মুছুন</button></td>
        </tr>`;
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function deleteStudent(key) {
    if (confirm('ছাত্র/ছাত্রীকে মুছতে চান?')) {
        db.ref('students/' + key).remove();
    }
}

// ============================================================
// ADD STUDENT
// ============================================================
document.getElementById('addCousinBtn').addEventListener('click', () => {
    const name = document.getElementById('cousinName').value.trim();
    const id = document.getElementById('cousinId').value.trim();
    const password = document.getElementById('cousinPass').value.trim();
    const group = document.getElementById('cousinGroup').value;
    const guardianPhone = document.getElementById('cousinGuardianPhone').value.trim();
    
    if (!name || !id || !password) {
        alert('নাম, আইডি এবং পাসওয়ার্ড দিন');
        return;
    }
    if (!selectedClass) {
        alert('ক্লাস নির্বাচন করুন');
        return;
    }
    
    if (isGroupRequired(selectedClass)) {
        if (!group) {
            alert('⚠️ এই ক্লাসের জন্য গ্রুপ নির্বাচন আবশ্যক!');
            document.getElementById('cousinGroup').focus();
            return;
        }
    }
    
    const newStudent = {
        name: name,
        id: id,
        password: password,
        class: selectedClass,
        group: group || '',
        guardianPhone: guardianPhone || '',
        image: document.getElementById('studentImagePreview').src
    };
    
    const ref = db.ref('students').push();
    ref.set(newStudent).then(() => {
        document.getElementById('cousinName').value = '';
        document.getElementById('cousinId').value = '';
        document.getElementById('cousinPass').value = '';
        document.getElementById('cousinGroup').value = '';
        document.getElementById('cousinGuardianPhone').value = '';
        alert('✅ ছাত্র/ছাত্রী যোগ করা হয়েছে');
    }).catch((error) => {
        alert('❌ যোগ করতে সমস্যা হয়েছে: ' + error.message);
    });
});

document.getElementById('studentImageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('studentImagePreview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// ============================================================
// ADD TEACHER
// ============================================================
function populateClassCheckboxes() {
    const container = document.getElementById('classCheckboxes');
    if (!container) return;
    container.innerHTML = '<p style="font-size:13px; margin-bottom:8px; color:white;"><strong>ক্লাস নির্বাচন করুন:</strong></p>';
    allClasses.forEach(cls => {
        const label = document.createElement('label');
        label.style.cssText = 'display:inline-block; margin-right:12px; font-size:13px; color:rgba(255,255,255,0.8);';
        label.innerHTML = `<input type="checkbox" class="teacher-class-checkbox" value="${cls}"> ${cls}`;
        container.appendChild(label);
    });
}

document.getElementById('createTeacherBtn').addEventListener('click', () => {
    const name = document.getElementById('newTeacherName').value.trim();
    const id = document.getElementById('newTeacherId').value.trim();
    const password = document.getElementById('newTeacherPass').value.trim();
    const checkboxes = document.querySelectorAll('.teacher-class-checkbox:checked');
    const classes = Array.from(checkboxes).map(cb => cb.value);
    if (!name || !id || !password) {
        alert('নাম, আইডি এবং পাসওয়ার্ড দিন');
        return;
    }
    if (classes.length === 0) {
        alert('কমপক্ষে একটি ক্লাস নির্বাচন করুন');
        return;
    }
    const newTeacher = {
        name: name,
        id: id,
        password: password,
        classes: classes,
        image: document.getElementById('teacherImagePreview').src
    };
    const ref = db.ref('teachers').push();
    ref.set(newTeacher).then(() => {
        document.getElementById('newTeacherName').value = '';
        document.getElementById('newTeacherId').value = '';
        document.getElementById('newTeacherPass').value = '';
        document.querySelectorAll('.teacher-class-checkbox:checked').forEach(cb => cb.checked = false);
        alert('✅ শিক্ষক যোগ করা হয়েছে');
    }).catch((error) => {
        alert('❌ যোগ করতে সমস্যা হয়েছে: ' + error.message);
    });
});

document.getElementById('teacherImageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('teacherImagePreview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// ============================================================
// ROUTINE FUNCTIONS
// ============================================================
function renderTodayTomorrowRoutine() {
    const container = document.getElementById('todayTomorrowRoutine');
    if (!container) return;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];
    const tomorrowName = days[(today.getDay() + 1) % 7];
    
    let html = '<div class="routine-side-by-side">';
    
    html += `<div class="today-routine-card"><h3>📅 আজকের রুটিন (${todayName})</h3>`;
    let hasToday = false;
    if (allRoutines[todayName]) {
        const sortedKeys = Object.keys(allRoutines[todayName]).sort();
        for (let key of sortedKeys) {
            if (allRoutines[todayName][key]) {
                let displayName = key;
                let groupName = '';
                for (let g of GROUP_LIST) {
                    if (key.endsWith('_' + g)) {
                        displayName = key.replace('_' + g, '');
                        groupName = g;
                        break;
                    }
                }
                const icon = GROUP_ICONS[groupName] || '';
                const groupDisplay = groupName ? ` <span class="student-group-tag ${groupName.toLowerCase()}">${icon} ${groupName}</span>` : '';
                html += `<p><strong>${displayName}</strong>${groupDisplay}: ${allRoutines[todayName][key]}</p>`;
                hasToday = true;
            }
        }
    }
    if (!hasToday) {
        html += '<p style="color:rgba(255,255,255,0.6);">কোনো রুটিন নেই</p>';
    }
    html += '</div>';
    
    html += `<div class="tomorrow-routine-card"><h3>📅 আগামীকালের রুটিন (${tomorrowName})</h3>`;
    let hasTomorrow = false;
    if (allRoutines[tomorrowName]) {
        const sortedKeys = Object.keys(allRoutines[tomorrowName]).sort();
        for (let key of sortedKeys) {
            if (allRoutines[tomorrowName][key]) {
                let displayName = key;
                let groupName = '';
                for (let g of GROUP_LIST) {
                    if (key.endsWith('_' + g)) {
                        displayName = key.replace('_' + g, '');
                        groupName = g;
                        break;
                    }
                }
                const icon = GROUP_ICONS[groupName] || '';
                const groupDisplay = groupName ? ` <span class="student-group-tag ${groupName.toLowerCase()}">${icon} ${groupName}</span>` : '';
                html += `<p><strong>${displayName}</strong>${groupDisplay}: ${allRoutines[tomorrowName][key]}</p>`;
                hasTomorrow = true;
            }
        }
    }
    if (!hasTomorrow) {
        html += '<p style="color:rgba(255,255,255,0.6);">কোনো রুটিন নেই</p>';
    }
    html += '</div>';
    
    html += '</div>';
    container.innerHTML = html;
}

function renderRoutineEditor() {
    const container = document.getElementById('routineEditArea');
    if (!container) return;
    
    const classSelect = document.getElementById('routineClassSelect');
    const daySelect = document.getElementById('routineDaySelect');
    const groupSelect = document.getElementById('routineGroupSelect');
    
    if (!classSelect || !daySelect) return;
    
    const className = classSelect.value || 'One';
    const dayName = daySelect.value || 'Sunday';
    const groupName = groupSelect ? groupSelect.value : '';
    
    let html = `<div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:20px;">
        <h4 style="margin-bottom:15px; color:white;">📝 ${className} - ${dayName} ${groupName ? '(' + getGroupDisplayName(groupName) + ')' : ''}</h4>`;
    
    if (isGroupRequired(className)) {
        const groupsToShow = groupName ? [groupName] : GROUP_LIST;
        
        groupsToShow.forEach(grp => {
            const key = className + '_' + grp;
            const currentValue = allRoutines[dayName] && allRoutines[dayName][key] ? allRoutines[dayName][key] : '';
            const icon = GROUP_ICONS[grp] || '';
            
            html += `
                <div style="display:flex; gap:10px; align-items:center; margin-top:10px; padding:8px; background:${groupName === grp ? 'rgba(255,215,0,0.05)' : 'transparent'}; border-radius:10px;">
                    <span style="font-weight:bold; min-width:100px; color:white;">${icon} ${grp}:</span>
                    <input type="text" class="routine-group-input" data-class="${className}" data-group="${grp}" data-day="${dayName}" value="${currentValue}" placeholder="বিষয় লিখুন..." style="flex:1; margin-bottom:0; color:white;">
                </div>
            `;
        });
    } else {
        const currentValue = allRoutines[dayName] && allRoutines[dayName][className] ? allRoutines[dayName][className] : '';
        html += `
            <div style="display:flex; gap:10px; align-items:center; margin-top:10px;">
                <span style="font-weight:bold; min-width:60px; color:white;">বিষয়:</span>
                <input type="text" id="routineSingleInput" value="${currentValue}" placeholder="বিষয় লিখুন..." style="flex:1; margin-bottom:0; color:white;">
            </div>
        `;
    }
    
    html += `
        <p style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:12px;">
            <i class="fas fa-info-circle"></i> 
            ${isGroupRequired(className) ? '⚠️ প্রতিটি গ্রুপের জন্য আলাদা রুটিন দিন' : 'গ্রুপ প্রয়োজন নেই'}
        </p>
    `;
    html += '</div>';
    
    html += `<div style="margin-top:20px;">
        <h4 style="color:white;">📋 সব রুটিন (${dayName})</h4>
        <div class="table-responsive">
            <table class="routine-table">
                <thead>
                    <tr>
                        <th>ক্লাস</th>
                        <th>গ্রুপ</th>
                        <th>বিষয়</th>
                    </tr>
                </thead>
                <tbody>`;
    
    allClasses.forEach(cls => {
        if (isGroupRequired(cls)) {
            GROUP_LIST.forEach(grp => {
                const key = cls + '_' + grp;
                const val = allRoutines[dayName] && allRoutines[dayName][key] ? allRoutines[dayName][key] : '-';
                const icon = GROUP_ICONS[grp] || '';
                const isActive = (cls === className && grp === groupName);
                html += `<tr style="${isActive ? 'background:rgba(255,215,0,0.05);' : ''}">
                    <td>${cls}</td>
                    <td><span class="student-group-tag ${grp.toLowerCase()}">${icon} ${grp}</span></td>
                    <td>${val}</td>
                </tr>`;
            });
        } else {
            const val = allRoutines[dayName] && allRoutines[dayName][cls] ? allRoutines[dayName][cls] : '-';
            const isActive = (cls === className && !groupName);
            html += `<tr style="${isActive ? 'background:rgba(255,215,0,0.05);' : ''}">
                <td>${cls}</td>
                <td>${cls === 'SSC Special' ? '<span class="ssc-special-badge">🎯 SSC</span>' : '-'}</td>
                <td>${val}</td>
            </tr>`;
        }
    });
    
    html += `</tbody></table></div></div>`;
    container.innerHTML = html;
    
    document.querySelectorAll('.routine-group-input').forEach(input => {
        input.addEventListener('input', function() {
            const className = this.dataset.class;
            const groupName = this.dataset.group;
            const dayName = this.dataset.day;
            const value = this.value.trim();
            
            const key = className + '_' + groupName;
            const updatedRoutines = { ...allRoutines };
            if (!updatedRoutines[dayName]) updatedRoutines[dayName] = {};
            updatedRoutines[dayName][key] = value;
            
            db.ref('routines').set(updatedRoutines);
        });
    });
    
    const singleInput = document.getElementById('routineSingleInput');
    if (singleInput) {
        singleInput.addEventListener('input', function() {
            const classSelect = document.getElementById('routineClassSelect');
            const daySelect = document.getElementById('routineDaySelect');
            
            if (!classSelect || !daySelect) return;
            
            const className = classSelect.value;
            const dayName = daySelect.value;
            const value = this.value.trim();
            
            const updatedRoutines = { ...allRoutines };
            if (!updatedRoutines[dayName]) updatedRoutines[dayName] = {};
            updatedRoutines[dayName][className] = value;
            
            db.ref('routines').set(updatedRoutines);
        });
    }
}

function renderRoutineModal() {
    const container = document.getElementById('routineContent');
    if (!container) return;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];
    
    let html = `<table class="routine-table"><thead><tr><th>ক্লাস</th><th>গ্রুপ</th>`;
    days.forEach(day => {
        html += `<th>${day}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    allClasses.forEach(cls => {
        if (isGroupRequired(cls)) {
            GROUP_LIST.forEach(grp => {
                const key = cls + '_' + grp;
                const icon = GROUP_ICONS[grp] || '';
                html += `<tr><td><strong>${cls}</strong></td><td><span class="student-group-tag ${grp.toLowerCase()}">${icon} ${grp}</span></td>`;
                days.forEach(day => {
                    const val = allRoutines[day] && allRoutines[day][key] ? allRoutines[day][key] : '-';
                    const isToday = day === todayName;
                    html += `<td style="${isToday ? 'background:rgba(255,215,0,0.1); font-weight:bold;' : ''}">${val}</td>`;
                });
                html += '</tr>';
            });
        } else {
            html += `<tr><td><strong>${cls}</strong></td><td>${cls === 'SSC Special' ? '<span class="ssc-special-badge">🎯 SSC</span>' : '-'}</td>`;
            days.forEach(day => {
                const val = allRoutines[day] && allRoutines[day][cls] ? allRoutines[day][cls] : '-';
                const isToday = day === todayName;
                html += `<td style="${isToday ? 'background:rgba(255,215,0,0.1); font-weight:bold;' : ''}">${val}</td>`;
            });
            html += '</tr>';
        }
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

document.getElementById('saveAllRoutinesBtn').addEventListener('click', () => {
    alert('✅ সব রুটিন ইতিমধ্যে অটো-সেভ হয়েছে');
});

// ============================================================
// ATTENDANCE SYSTEM
// ============================================================
function setupAttendance() {
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        currentAttendanceDate = today;
    }
    
    populateAttendanceClassSelect();
    
    if (currentRole === 'student') {
        const studentSection = document.getElementById('studentHistorySection');
        if (studentSection) studentSection.style.display = 'block';
        const teacherSection = document.getElementById('teacherAttendanceSection');
        if (teacherSection) teacherSection.style.display = 'none';
        renderStudentAttendance();
    } else {
        const studentSection = document.getElementById('studentHistorySection');
        if (studentSection) studentSection.style.display = 'none';
        const teacherSection = document.getElementById('teacherAttendanceSection');
        if (teacherSection) teacherSection.style.display = 'block';
        renderClassMonthlyCalendar();
    }
}

document.getElementById('loadStudentsBtn').addEventListener('click', () => {
    const classSelect = document.getElementById('attendanceClassSelect');
    const groupSelect = document.getElementById('attendanceGroupSelect');
    const className = classSelect.value;
    const groupName = groupSelect ? groupSelect.value : 'all';
    const date = document.getElementById('attendanceDate').value;
    
    if (!className) {
        alert('ক্লাস নির্বাচন করুন');
        return;
    }
    if (!date) {
        alert('তারিখ নির্বাচন করুন');
        return;
    }
    currentAttendanceDate = date;
    document.getElementById('selectedDateDisplay').textContent = date;
    loadStudentAttendance(className, groupName, date);
});

function loadStudentAttendance(className, groupName, date) {
    const container = document.getElementById('studentAttendanceList');
    const section = document.getElementById('studentAttendanceSection');
    if (!container || !section) return;
    
    const students = {};
    for (let key in allStudents) {
        const student = allStudents[key];
        if (student.class === className) {
            if (groupName !== 'all' && student.group !== groupName) {
                continue;
            }
            students[key] = student;
        }
    }
    
    if (Object.keys(students).length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">এই ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>';
        section.style.display = 'block';
        return;
    }
    
    let html = '';
    for (let key in students) {
        const student = students[key];
        const attKey = `${className}_${date}`;
        const isPresent = attendanceData[attKey] && attendanceData[attKey][key] === true;
        const icon = GROUP_ICONS[student.group] || '';
        html += `<div class="student-att-row">
            <img src="${student.image || 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=' + encodeURIComponent(student.name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
            <span style="flex:1; color:white;">${student.name} ${student.group ? '<span class="student-group-tag ' + student.group.toLowerCase() + '">' + icon + ' ' + student.group + '</span>' : ''}</span>
            <span style="font-size:12px; color:rgba(255,255,255,0.5);">${student.id}</span>
            <label class="toggle-switch">
                <input type="checkbox" class="attendance-checkbox" data-student="${key}" ${isPresent ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>`;
    }
    container.innerHTML = html;
    section.style.display = 'block';
}

document.addEventListener('change', function(e) {
    if (e.target.classList.contains('attendance-checkbox')) {
        saveAttendanceAutomatically();
    }
});

function saveAttendanceAutomatically() {
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    const className = document.getElementById('attendanceClassSelect').value;
    const date = document.getElementById('attendanceDate').value;
    if (!className || !date) return;
    
    const attKey = `${className}_${date}`;
    const attData = {};
    checkboxes.forEach(cb => {
        const studentKey = cb.dataset.student;
        attData[studentKey] = cb.checked;
    });
    db.ref('attendance/' + attKey).set(attData);
}

document.getElementById('saveAttendanceBtn').addEventListener('click', () => {
    saveAttendanceAutomatically();
    alert('✅ উপস্থিতি সংরক্ষণ করা হয়েছে');
});

function renderStudentAttendance() {
    if (!currentUserKey || !allStudents[currentUserKey]) return;
    const student = allStudents[currentUserKey];
    const className = student.class;
    const summaryContainer = document.getElementById('studentSummary');
    const calendarContainer = document.getElementById('studentCalendarGrid');
    const monthSelector = document.getElementById('studentMonthSelector');
    if (!summaryContainer || !calendarContainer || !monthSelector) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + studentMonthOffset;
    const currentDate = new Date(year, month);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    monthSelector.innerHTML = `
        <button class="btn btn-sm btn-blue" onclick="changeStudentMonth(-1)">◀</button>
        <span style="font-weight:bold; color:white;">${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button class="btn btn-sm btn-blue" onclick="changeStudentMonth(1)">▶</button>
    `;
    
    let totalDays = 0;
    let presentDays = 0;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    let html = '<div class="calendar-grid">';
    ['সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি', 'রবি'].forEach(day => {
        html += `<div class="cal-day-header">${day}</div>`;
    });
    
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="cal-day"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const attKey = `${className}_${dateStr}`;
        const isPresent = attendanceData[attKey] && attendanceData[attKey][currentUserKey] === true;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;
        
        let statusClass = '';
        let statusIcon = '';
        if (isPresent) {
            statusClass = 'present';
            statusIcon = '✅';
            presentDays++;
        } else if (attendanceData[attKey]) {
            statusClass = 'absent';
            statusIcon = '❌';
        }
        if (isToday) statusClass += ' today';
        totalDays++;
        
        html += `<div class="cal-day ${statusClass}">
            <div class="date-num">${day}</div>
            <div class="status-icon">${statusIcon}</div>
        </div>`;
    }
    
    html += '</div>';
    calendarContainer.innerHTML = html;
    
    const presentPercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    summaryContainer.innerHTML = `
        <div class="summary-item"><span class="number">${presentDays}</span><br>উপস্থিত</div>
        <div class="summary-item"><span class="number">${totalDays - presentDays}</span><br>অনুপস্থিত</div>
        <div class="summary-item"><span class="number">${presentPercent}%</span><br>হার</div>
    `;
}

function changeStudentMonth(delta) {
    studentMonthOffset += delta;
    renderStudentAttendance();
}

function renderClassMonthlyCalendar() {
    const container = document.getElementById('classMonthlyCalendar');
    const monthSelector = document.getElementById('classMonthSelector');
    if (!container || !monthSelector) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + classMonthOffset;
    const currentDate = new Date(year, month);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const className = document.getElementById('attendanceClassSelect')?.value || 'One';
    const groupName = document.getElementById('attendanceGroupSelect')?.value || 'all';
    
    monthSelector.innerHTML = `
        <button class="btn btn-sm btn-blue" onclick="changeClassMonth(-1)">◀</button>
        <span style="font-weight:bold; color:white;">${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} - ${className} ${groupName !== 'all' ? '(' + getGroupDisplayName(groupName) + ')' : ''}</span>
        <button class="btn btn-sm btn-blue" onclick="changeClassMonth(1)">▶</button>
    `;
    
    const students = {};
    for (let key in allStudents) {
        const student = allStudents[key];
        if (student.class === className) {
            if (groupName !== 'all' && student.group !== groupName) {
                continue;
            }
            students[key] = student;
        }
    }
    
    if (Object.keys(students).length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">এই ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>';
        return;
    }
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    let html = '<div class="calendar-grid">';
    ['সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি', 'রবি'].forEach(day => {
        html += `<div class="cal-day-header">${day}</div>`;
    });
    
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="cal-day"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const attKey = `${className}_${dateStr}`;
        const dayData = attendanceData[attKey] || {};
        
        let presentCount = 0;
        let absentCount = 0;
        for (let key in students) {
            if (dayData[key] === true) presentCount++;
            else if (dayData[key] === false) absentCount++;
        }
        
        const total = Object.keys(students).length;
        const allPresent = presentCount === total && total > 0;
        const allAbsent = absentCount === total && total > 0;
        
        let statusClass = '';
        let statusText = '';
        if (allPresent) {
            statusClass = 'present';
            statusText = '✅ সবাই';
        } else if (allAbsent) {
            statusClass = 'absent';
            statusText = '❌ সবাই';
        } else if (presentCount > 0 || absentCount > 0) {
            statusText = `${presentCount}/${total}`;
        }
        
        const isToday = new Date().toISOString().split('T')[0] === dateStr;
        if (isToday) statusClass += ' today';
        
        html += `<div class="cal-day ${statusClass}">
            <div class="date-num">${day}</div>
            <div style="font-size:10px;">${statusText}</div>
        </div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function changeClassMonth(delta) {
    classMonthOffset += delta;
    renderClassMonthlyCalendar();
}

// ============================================================
// STUDENT INFO with Group
// ============================================================
function renderStudentInfo(studentData) {
    const card = document.getElementById('studentClassInfo');
    if (!card || !studentData) return;
    card.style.display = 'block';
    document.getElementById('studentNameDisplay').textContent = studentData.name;
    document.getElementById('studentClassDisplay').textContent = studentData.class === 'SSC Special' ? '🎯 SSC Special' : studentData.class;
    const icon = GROUP_ICONS[studentData.group] || '';
    document.getElementById('studentGroupDisplay').textContent = studentData.group ? icon + ' ' + studentData.group : '-';
    document.getElementById('studentIdDisplay').textContent = studentData.id;
    
    renderStudentOwnRoutine();
}

// ============================================================
// TEACHER PROFILE
// ============================================================
function renderTeacherProfile(teacherData) {
    const container = document.getElementById('teacherProfileArea');
    if (!container) return;
    container.innerHTML = `
        <div style="display:flex; align-items:center; gap:20px; background:rgba(255,255,255,0.05); padding:20px; border-radius:20px;">
            <img src="${teacherData.image || 'https://ui-avatars.com/api/?background=1e7b4a&color=fff&name=' + encodeURIComponent(teacherData.name)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #ffd700;">
            <div>
                <h3 style="border:none; padding:0; color:white;">${teacherData.name}</h3>
                <p style="color:rgba(255,255,255,0.8);"><strong>আইডি:</strong> ${teacherData.id}</p>
                <p style="color:rgba(255,255,255,0.8);"><strong>ক্লাস:</strong> ${teacherData.classes ? teacherData.classes.join(', ') : ''}</p>
            </div>
        </div>
    `;
}

function renderTeacherAssignedClasses(teacherData) {
    const container = document.getElementById('teacherAssignedClasses');
    if (!container) return;
    const assignedClasses = teacherData.classes || [];
    if (assignedClasses.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">আপনার কোনো ক্লাস নেই</p>';
        return;
    }
    let html = '<h3 style="color:white;">আপনার ক্লাসসমূহ</h3><div style="display:flex; flex-wrap:wrap; gap:10px;">';
    assignedClasses.forEach(cls => {
        const displayClass = cls === 'SSC Special' ? '🎯 SSC Special' : cls;
        html += `<span style="background:#ffd700; color:#191970; padding:8px 16px; border-radius:30px; font-weight:bold;">${displayClass}</span>`;
    });
    html += '</div>';
    container.innerHTML = html;
    if (assignedClasses.length > 0) {
        renderTeacherClassStudents(assignedClasses[0]);
    }
}

function renderTeacherClassStudents(className) {
    const container = document.getElementById('teacherClassStudents');
    if (!container) return;
    const students = {};
    for (let key in allStudents) {
        if (allStudents[key].class === className) {
            students[key] = allStudents[key];
        }
    }
    if (Object.keys(students).length === 0) {
        container.innerHTML = `<p style="color:rgba(255,255,255,0.5);">${className} ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>`;
        return;
    }
    let html = `<h3 style="color:white;">${className === 'SSC Special' ? '🎯 SSC Special' : className} ক্লাসের ছাত্র/ছাত্রী</h3><div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:10px;">`;
    for (let key in students) {
        const s = students[key];
        const icon = GROUP_ICONS[s.group] || '';
        const groupClass = s.group ? s.group.toLowerCase() : '';
        html += `<div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:16px; text-align:center;">
            <img src="${s.image || 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=' + encodeURIComponent(s.name)}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #ffd700;">
            <p style="margin-top:5px; color:white;"><strong>${s.name}</strong></p>
            <p style="font-size:12px; color:rgba(255,255,255,0.5);">${s.id}</p>
            ${s.group ? `<p style="font-size:11px; margin-top:3px;"><span class="student-group-tag ${groupClass}">${icon} ${s.group}</span></p>` : ''}
            ${s.class === 'SSC Special' ? `<p style="margin-top:3px;"><span class="ssc-special-badge">🎯 SSC Special</span></p>` : ''}
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// ============================================================
// FEEDBACK SYSTEM
// ============================================================
function renderStudentFeedbackArea() {
    const container = document.getElementById('studentFeedbackArea');
    if (!container) return;
    if (!currentUserKey || !allStudents[currentUserKey]) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">আপনি লগইন করেননি</p>';
        return;
    }
    const student = allStudents[currentUserKey];
    const className = student.class;
    const icon = GROUP_ICONS[student.group] || '';
    let html = `<p style="margin-bottom:15px; color:white;"><strong>আপনার ক্লাস:</strong> ${className === 'SSC Special' ? '🎯 SSC Special' : className} ${student.group ? '(' + icon + ' ' + student.group + ')' : ''}</p>
        <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:20px;">
            <textarea id="feedbackText" rows="3" placeholder="আপনার মতামত লিখুন..." style="width:100%; border-radius:15px; color:white;"></textarea>
            <button class="btn btn-orange" onclick="submitFeedback()" style="margin-top:10px;"><i class="fas fa-paper-plane"></i> পাঠান</button>
        </div>
        <div id="myFeedbackList" style="margin-top:20px;"></div>
    `;
    container.innerHTML = html;
    renderMyFeedback();
}

function renderMyFeedback() {
    const container = document.getElementById('myFeedbackList');
    if (!container) return;
    const student = allStudents[currentUserKey];
    if (!student) return;
    let html = '<h4 style="color:white;">আপনার মতামতসমূহ</h4>';
    let hasFeedback = false;
    for (let key in feedbackData) {
        const fb = feedbackData[key];
        if (fb.studentId === student.id) {
            hasFeedback = true;
            const icon = GROUP_ICONS[fb.group] || '';
            html += `<div class="feedback-item">
                <p style="color:white;">${fb.text}</p>
                <p style="font-size:11px; color:rgba(255,255,255,0.5);">${fb.date || ''} ${fb.group ? '| ' + icon + ' ' + fb.group : ''}</p>
                <button class="delete-btn" onclick="deleteFeedback('${key}')">মুছুন</button>
            </div>`;
        }
    }
    if (!hasFeedback) {
        html += '<p style="color:rgba(255,255,255,0.5);">আপনার কোনো মতামত নেই</p>';
    }
    container.innerHTML = html;
}

function submitFeedback() {
    const text = document.getElementById('feedbackText')?.value.trim();
    if (!text) {
        alert('মতামত লিখুন');
        return;
    }
    const student = allStudents[currentUserKey];
    if (!student) return;
    const feedback = {
        studentId: student.id,
        studentName: student.name,
        className: student.class,
        group: student.group || '',
        text: text,
        date: new Date().toISOString().split('T')[0]
    };
    db.ref('feedback').push(feedback).then(() => {
        const input = document.getElementById('feedbackText');
        if (input) input.value = '';
        alert('✅ মতামত পাঠানো হয়েছে');
    }).catch((error) => {
        alert('❌ পাঠাতে সমস্যা হয়েছে: ' + error.message);
    });
}

function deleteFeedback(key) {
    if (confirm('মতামত মুছতে চান?')) {
        db.ref('feedback/' + key).remove();
    }
}

function populateFeedbackClassFilter() {
    const select = document.getElementById('feedbackClassFilter');
    if (!select) return;
    select.innerHTML = '<option value="all" style="color:white;">সব ক্লাস</option>';
    allClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls === 'SSC Special' ? '🎯 SSC Special' : cls;
        option.style.color = 'white';
        select.appendChild(option);
    });
}

document.getElementById('feedbackClassFilter')?.addEventListener('change', renderFeedbackList);

function renderFeedbackList() {
    const container = document.getElementById('feedbackList');
    if (!container) return;
    const filter = document.getElementById('feedbackClassFilter')?.value || 'all';
    let html = '';
    let count = 0;
    for (let key in feedbackData) {
        const fb = feedbackData[key];
        if (filter !== 'all' && fb.className !== filter) continue;
        count++;
        const icon = GROUP_ICONS[fb.group] || '';
        html += `<div class="feedback-item">
            <p style="color:white;"><strong>${fb.studentName}</strong> (${fb.className === 'SSC Special' ? '🎯 SSC Special' : fb.className}${fb.group ? ' - ' + icon + ' ' + fb.group : ''})</p>
            <p style="color:white;">${fb.text}</p>
            <p style="font-size:11px; color:rgba(255,255,255,0.5);">${fb.date || ''}</p>
            <button class="delete-btn" onclick="deleteFeedback('${key}')">মুছুন</button>
        </div>`;
    }
    if (count === 0) {
        html = '<p style="color:rgba(255,255,255,0.5); text-align:center;">কোনো মতামত নেই</p>';
    }
    container.innerHTML = html;
}

// ============================================================
// SOCIAL FEED
// ============================================================
document.getElementById('feedImageInput')?.addEventListener('change', function(e) {
    const files = e.target.files;
    const container = document.getElementById('imagePreviewContainer');
    if (!container) return;
    container.innerHTML = '';
    feedImages = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(event) {
            feedImages.push(event.target.result);
            const img = document.createElement('img');
            img.src = event.target.result;
            img.style.cssText = 'width:80px; height:80px; object-fit:cover; border-radius:12px; border:2px solid #ffd700;';
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});

window.publishPost = function() {
    const caption = document.getElementById('feedCaption')?.value.trim() || '';
    if (!caption && feedImages.length === 0) {
        alert('কিছু লিখুন বা ছবি নির্বাচন করুন');
        return;
    }
    
    if (!currentUserKey) {
        alert('আপনি লগইন করেননি');
        return;
    }
    
    const post = {
        caption: caption,
        images: feedImages,
        user: currentUserKey,
        userName: currentUserName || 'ব্যবহারকারী',
        role: currentRole || 'ছাত্র',
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        likedBy: {},
        comments: {}
    };
    
    const ref = db.ref('feed').push();
    ref.set(post).then(() => {
        const captionInput = document.getElementById('feedCaption');
        if (captionInput) captionInput.value = '';
        const previewContainer = document.getElementById('imagePreviewContainer');
        if (previewContainer) previewContainer.innerHTML = '';
        feedImages = [];
        const fileInput = document.getElementById('feedImageInput');
        if (fileInput) fileInput.value = '';
        alert('✅ পোস্ট প্রকাশিত হয়েছে');
    }).catch((error) => {
        alert('❌ পোস্ট করতে সমস্যা হয়েছে: ' + error.message);
    });
};

function renderSocialFeed() {
    const container = document.getElementById('socialFeedContainer');
    if (!container) return;
    const posts = [];
    for (let key in feedData) {
        posts.push({ key, data: feedData[key] });
    }
    posts.sort((a, b) => (b.data.timestamp || 0) - (a.data.timestamp || 0));
    if (posts.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5); text-align:center;">কোনো পোস্ট নেই</p>';
        return;
    }
    let html = '';
    posts.forEach(post => {
        const p = post.data;
        const isOwner = p.user === currentUserKey || currentRole === 'admin';
        html += `<div class="social-card" id="post-${post.key}">
            ${isOwner ? `<button class="delete-post-btn" onclick="deletePost('${post.key}')">✕</button>` : ''}
            <p style="color:white;"><strong>${p.userName || p.user}</strong> <span style="font-size:12px; color:rgba(255,255,255,0.5);">(${p.role || ''})</span></p>
            <p style="font-size:12px; color:rgba(255,255,255,0.5);">${p.date || ''}</p>
            <p style="margin:10px 0; color:white;">${p.caption || ''}</p>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin:10px 0;">
                ${p.images ? p.images.map(img => `<img src="${img}" style="max-width:200px; max-height:200px; border-radius:12px; object-fit:cover;">`).join('') : ''}
            </div>
            <div class="reaction-bar">
                <button class="reaction-btn ${p.likedBy && p.likedBy[currentUserKey] ? 'active' : ''}" onclick="likePost('${post.key}')">
                    👍 <span class="reaction-count">${p.likes || 0}</span>
                </button>
                <button class="reaction-btn" onclick="toggleComment('${post.key}')">
                    💬 <span class="reaction-count">${p.comments ? Object.keys(p.comments).length : 0}</span>
                </button>
            </div>
            <div id="comment-section-${post.key}" style="display:none; margin-top:10px;">
                <div id="comments-${post.key}">
                    ${renderComments(p.comments)}
                </div>
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <input type="text" id="comment-input-${post.key}" placeholder="মন্তব্য লিখুন..." style="flex:1; margin-bottom:0; color:white;">
                    <button class="btn btn-sm btn-blue" onclick="addComment('${post.key}')">পাঠান</button>
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function renderComments(comments) {
    if (!comments || Object.keys(comments).length === 0) {
        return '<p style="color:rgba(255,255,255,0.5); font-size:13px;">কোনো মন্তব্য নেই</p>';
    }
    let html = '';
    for (let key in comments) {
        const c = comments[key];
        html += `<div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:12px; margin-bottom:5px;">
            <strong style="color:white;">${c.userName || c.user}</strong> <span style="font-size:11px; color:rgba(255,255,255,0.5);">${c.date || ''}</span>
            <p style="margin:2px 0; color:white;">${c.text}</p>
        </div>`;
    }
    return html;
}

function toggleComment(postKey) {
    const section = document.getElementById(`comment-section-${postKey}`);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

function addComment(postKey) {
    const input = document.getElementById(`comment-input-${postKey}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        alert('মন্তব্য লিখুন');
        return;
    }
    if (!currentUserKey) {
        alert('আপনি লগইন করেননি');
        return;
    }
    const comment = {
        user: currentUserKey,
        userName: currentUserName || 'ব্যবহারকারী',
        text: text,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
    };
    const ref = db.ref(`feed/${postKey}/comments`).push();
    ref.set(comment).then(() => {
        input.value = '';
    }).catch((error) => {
        alert('❌ মন্তব্য করতে সমস্যা হয়েছে: ' + error.message);
    });
}

function likePost(postKey) {
    if (!currentUserKey) {
        alert('আপনি লগইন করেননি');
        return;
    }
    const postRef = db.ref(`feed/${postKey}`);
    postRef.transaction((currentData) => {
        if (currentData === null) return currentData;
        if (!currentData.likedBy) currentData.likedBy = {};
        if (!currentData.likes) currentData.likes = 0;
        if (currentData.likedBy[currentUserKey]) {
            delete currentData.likedBy[currentUserKey];
            currentData.likes--;
        } else {
            currentData.likedBy[currentUserKey] = true;
            currentData.likes++;
        }
        return currentData;
    });
}

function deletePost(postKey) {
    if (confirm('পোস্ট মুছতে চান?')) {
        db.ref('feed/' + postKey).remove();
    }
}

// ============================================================
// BUTTON EVENT LISTENERS
// ============================================================
document.getElementById('viewRoutineBtn')?.addEventListener('click', () => {
    document.getElementById('routineModal').style.display = 'flex';
    renderRoutineModal();
});

document.getElementById('viewResultBtn')?.addEventListener('click', () => {
    document.getElementById('resultModal').style.display = 'flex';
});

document.getElementById('aboutUsBtn')?.addEventListener('click', () => {
    document.getElementById('aboutModal').style.display = 'flex';
});

document.getElementById('saveClassBtn')?.addEventListener('click', () => {
    alert('✅ সব তথ্য ইতিমধ্যে Firebase এ অটো-সেভ আছে।');
});

// ============================================================
// AUTO LOGIN CHECK
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const hasSession = checkSession();
    if (!hasSession) {
        loginScreen.style.display = 'flex';
    }
});

console.log('📚 মাস্টারমাইন্ড অ্যাকাডেমি সিস্টেম লোড হয়েছে');
console.log('✅ Firebase Connected');
console.log('✅ অটো-সেভ সক্রিয় আছে');
console.log('✅ SSC Special ক্লাস হিসেবে আছে (গ্রুপ নয়)');
