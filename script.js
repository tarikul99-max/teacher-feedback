


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



window.db = db;
window.firebase = firebase;


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

const GROUP_LIST = ['Science', 'Commerce', 'Arts'];
const GROUP_ICONS = {
    'Science': '🔬',
    'Commerce': '💼',
    'Arts': '⚖️'
};
const GROUP_REQUIRED_CLASSES = ['Nine', 'Ten', 'SSC Special'];

// ============================================================
// DOM REFS
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
// HELPERS
// ============================================================
function isGroupRequired(className) {
    return GROUP_REQUIRED_CLASSES.includes(className);
}

function getGroupDisplayName(group) {
    const icon = GROUP_ICONS[group] || '';
    return icon ? icon + ' ' + group : group;
}

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
// MODAL
// ============================================================
window.closeModalOutside = function(event, modalId) {
    const modal = document.getElementById(modalId);
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// ============================================================
// TOGGLE GROUP FIELD
// ============================================================
function toggleGroupField(className) {
    const groupContainer = document.getElementById('groupFieldContainer');
    const groupSelect = document.getElementById('cousinGroup');
    const requiredMsg = document.getElementById('groupRequiredMsg');
    
    if (className && isGroupRequired(className)) {
        groupContainer.style.display = 'block';
        groupSelect.required = true;
        if (requiredMsg) {
            if (className === 'SSC Special') {
                requiredMsg.textContent = '⚠️ SSC Special এর জন্য গ্রুপ নির্বাচন আবশ্যক';
            } else {
                requiredMsg.textContent = '⚠️ SSC (নবম-দশম) শ্রেণির জন্য গ্রুপ নির্বাচন আবশ্যক';
            }
            requiredMsg.style.color = '#ffd700';
        }
    } else {
        groupContainer.style.display = className ? 'block' : 'none';
        groupSelect.required = false;
        groupSelect.value = '';
        if (requiredMsg) {
            requiredMsg.textContent = 'গ্রুপ নির্বাচন ঐচ্ছিক (শুধু Nine, Ten, SSC Special এর জন্য আবশ্যক)';
            requiredMsg.style.color = 'rgba(255,255,255,0.4)';
        }
    }
}
window.toggleGroupField = toggleGroupField;

// ============================================================
// GLORIOUS TEXT ANIMATION - NAVBAR
// ============================================================
function animateGloriousText() {
    const h1 = document.querySelector('.brand-text h1');
    if (!h1) return;
    if (h1.querySelector('.letter')) return;
    
    const text = h1.textContent;
    if (text !== 'MASTERMIND') return;
    
    h1.textContent = '';
    const colors = ['#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#0ABDE3', '#10AC84', '#EE5A24', '#e16a24','#55156e','#350e89'];
    const rotations = [20, -14, 8, -12, 14, -15, 16, -20, 15, -17];
    const translations = [-3, 2, -4, 1, -2, 3, -1, 2, -3, 2];
    
    text.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = letter;
        span.style.display = 'inline-block';
        span.style.color = colors[index % colors.length];
        span.style.transform = `rotate(${rotations[index]}deg) translateY(${translations[index]}px)`;
        span.style.transformOrigin = index % 2 === 0 ? 'center bottom' : 'center top';
        span.style.textShadow = `0 0 20px ${colors[index % colors.length]}66`;
        span.style.transition = 'all 0.3s ease';
        h1.appendChild(span);
    });
}

// ============================================================
// LOGIN BRAND TEXT ANIMATION
// ============================================================
function animateLoginGloriousText() {
    const h3 = document.getElementById('loginBrandText');
    if (!h3 || h3.dataset.animated === 'true') return;
    h3.dataset.animated = 'true';
    
    const letters = h3.querySelectorAll('.letter');
    const colors = [
        '#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#0ABDE3', 
        '#10AC84', '#EE5A24', '#FF6B6B', '#FF9F43', '#FECA57',
        '#48DBFB', '#0ABDE3', '#10AC84', '#EE5A24', '#FF6B6B',
        '#FF9F43', '#FECA57', '#48DBFB', '#0ABDE3', '#10AC84'
    ];
    const rotations = [
        20, -14, 8, -12, 14, -15, 16, -20, 12, -8,
        5, -7, 8, -9, 9, -11, 15, -10, 18, -13
    ];
    const translations = [
        -3, 2, -4, 1, -2, 3, -1, 2, -2, 1,
        -2, 1, -1, 2, -1, 1, -2, 1, -3, 2
    ];
    
    let colorIndex = 0;
    let rotIndex = 0;
    
    letters.forEach((letter) => {
        if (letter.classList.contains('space')) {
            return;
        }
        if (colorIndex < colors.length) {
            letter.style.color = colors[colorIndex];
            letter.style.textShadow = `0 0 20px ${colors[colorIndex]}66`;
        }
        if (rotIndex < rotations.length) {
            letter.style.transform = `rotate(${rotations[rotIndex]}deg) translateY(${translations[rotIndex]}px)`;
            letter.style.transformOrigin = rotIndex % 2 === 0 ? 'center bottom' : 'center top';
        }
        letter.style.transition = 'all 0.3s ease';
        colorIndex++;
        rotIndex++;
    });
}

// ============================================================
// BISMILLAH ANIMATION
// ============================================================
function animateBismillah() {
    const bismillah = document.querySelector('.bismillah');
    if (bismillah) {
        setInterval(() => {
            bismillah.style.transition = 'opacity 0.8s ease';
            bismillah.style.opacity = '0.3';
            setTimeout(() => {
                bismillah.style.opacity = '0.8';
            }, 400);
        }, 4000);
    }
}

// ============================================================
// LOGIN
// ============================================================
function performLogin(id, password, role) {
    if (!id || !password) {
        alert('আইডি এবং পাসওয়ার্ড দিন');
        return false;
    }

    if (role === 'admin') {
        if (id === 'admin' && password === 'head-office') {
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
            const teachers = snapshot.val() || {};
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
            const students = snapshot.val() || {};
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
            const teacherRef = db.ref('teachers/' + user);
            teacherRef.once('value', (snapshot) => {
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
            const studentRef = db.ref('students/' + user);
            studentRef.once('value', (snapshot) => {
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
    setTimeout(animateGloriousText, 500);
}

// ============================================================
// LOAD ALL DATA
// ============================================================
function loadAllData() {
    const teachersRef = db.ref('teachers');
    teachersRef.on('value', (snapshot) => {
        allTeachers = snapshot.val() || {};
        renderTeachers();
        renderTeachersTable();
        renderTeacherGrid();
    });

    const studentsRef = db.ref('students');
    studentsRef.on('value', (snapshot) => {
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

    const routinesRef = db.ref('routines');
    routinesRef.on('value', (snapshot) => {
        allRoutines = snapshot.val() || {};
        renderTodayTomorrowRoutine();
        renderRoutineEditor();
        renderRoutineModal();
        renderStudentOwnRoutine();
        renderFullRoutine();
    });

    const feedRef = db.ref('feed');
    feedRef.on('value', (snapshot) => {
        feedData = snapshot.val() || {};
        renderSocialFeed();
    });

    const feedbackRef = db.ref('feedback');
    feedbackRef.on('value', (snapshot) => {
        feedbackData = snapshot.val() || {};
        renderFeedbackList();
        renderStudentFeedbackArea();
    });

    const attendanceRef = db.ref('attendance');
    attendanceRef.on('value', (snapshot) => {
        attendanceData = snapshot.val() || {};
        if (currentRole === 'student' && currentUserKey) {
            renderStudentAttendance();
        }
        if (currentRole === 'teacher' || currentRole === 'admin') {
            renderClassMonthlyCalendar();
        }
    });
}

// ============================================================
// FULL ROUTINE DISPLAY
// ============================================================
function renderFullRoutine() {
    const container = document.getElementById('fullRoutineDisplay');
    if (!container) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const today = new Date();
    const todayName = days[today.getDay()];

    let html = `<div class="table-responsive">
        <table class="routine-table">
            <thead>
                <tr>
                    <th>ক্লাস</th>
                    <th>গ্রুপ</th>`;

    days.forEach((day, index) => {
        const isToday = day === todayName;
        html += `<th style="${isToday ? 'color:#ffd700; font-weight:800;' : ''}">${banglaDays[index]}${isToday ? ' 📌' : ''}</th>`;
    });

    html += `</tr></thead><tbody>`;

    const sortedClasses = [...allClasses];
    sortedClasses.sort((a, b) => {
        if (a === 'SSC Special') return -1;
        if (b === 'SSC Special') return 1;
        return a.localeCompare(b);
    });

    sortedClasses.forEach(cls => {
        if (isGroupRequired(cls)) {
            GROUP_LIST.forEach(grp => {
                const key = cls + '_' + grp;
                const icon = GROUP_ICONS[grp] || '';
                const isSscSpecial = cls === 'SSC Special';
                const groupTagClass = isSscSpecial ? 'ssc-special' : grp.toLowerCase();
                
                html += `<tr><td><strong>${isSscSpecial ? '🎯 ' + cls : cls}</strong></td>
                    <td><span class="routine-group-tag ${groupTagClass}">${isSscSpecial ? '🎯 ' + icon + ' ' + grp : icon + ' ' + grp}</span></td>`;
                
                days.forEach(day => {
                    const val = allRoutines[day] && allRoutines[day][key] ? allRoutines[day][key] : '-';
                    const isToday = day === todayName;
                    html += `<td style="${isToday ? 'background:rgba(255,215,0,0.08); font-weight:600; color:#ffd700;' : ''}">${val}</td>`;
                });
                html += '</tr>';
            });
        } else {
            html += `<tr><td><strong>${cls}</strong></td><td>-</td>`;
            days.forEach(day => {
                const val = allRoutines[day] && allRoutines[day][cls] ? allRoutines[day][cls] : '-';
                const isToday = day === todayName;
                html += `<td style="${isToday ? 'background:rgba(255,215,0,0.08); font-weight:600; color:#ffd700;' : ''}">${val}</td>`;
            });
            html += '</tr>';
        }
    });

    html += '</tbody></table></div>';

    let hasRoutine = false;
    for (let day in allRoutines) {
        if (Object.keys(allRoutines[day]).length > 0) {
            hasRoutine = true;
            break;
        }
    }

    if (!hasRoutine) {
        html = `<div class="empty-routine">
            <i class="fas fa-calendar-times"></i>
            <p>কোনো রুটিন যোগ করা হয়নি।</p>
            <p style="font-size:14px; opacity:0.6;">অ্যাডমিন রুটিন যোগ করুন।</p>
        </div>`;
    }

    container.innerHTML = html;
}

// ============================================================
// RENDER TEACHERS
// ============================================================
function renderTeachers() {
    const grid = document.getElementById('teachersGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let key in allTeachers) {
        const teacher = allTeachers[key];
        const card = document.createElement('div');
        card.className = 'teacher-card';
        
        const isCoordinator = teacher.isOfficeCoordinator || false;
        const coordinatorBadge = isCoordinator ? `
            <span style="display:inline-block; background:linear-gradient(135deg,#ffd700,#f5a623); color:#191970; padding:4px 16px; border-radius:30px; font-size:13px; font-weight:700; margin-top:8px;">
                <i class="fas fa-user-tie"></i> Office Coordinator
            </span>
        ` : '';
        
        const classDisplay = isCoordinator ? 
            '<p style="font-size:12px; color:rgba(255,255,255,0.4); font-style:italic;">কোন ক্লাস নেই</p>' : 
            `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px;">
                ${teacher.classes ? teacher.classes.map(c => `<span style="background:rgba(255,215,0,0.15);padding:4px 14px;border-radius:30px;font-size:12px;color:#ffd700;font-weight:600;">${c === 'SSC Special' ? '🎯 ' + c : c}</span>`).join('') : ''}
            </div>`;
        
        card.innerHTML = `
            <img src="${teacher.image || 'https://ui-avatars.com/api/?background=1e7b4a&color=fff&name=' + encodeURIComponent(teacher.name)}" alt="${teacher.name}">
            <h4>${teacher.name}</h4>
            <p style="font-size:13px;">আইডি: ${teacher.id}</p>
            ${classDisplay}
            ${coordinatorBadge}
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
        container.innerHTML = '<p class="empty-state">কোনো শিক্ষক নেই</p>';
        return;
    }
    let html = `<div class="table-responsive"><table><thead><tr><th>ছবি</th><th>নাম</th><th>আইডি</th><th>ক্লাস</th><th>রোল</th><th>অ্যাকশন</th></tr></thead><tbody>`;
    for (let key in allTeachers) {
        const t = allTeachers[key];
        const isCoordinator = t.isOfficeCoordinator || false;
        const roleText = isCoordinator ? 
            '<span style="color:#ffd700;font-weight:700;"><i class="fas fa-user-tie"></i> Coordinator</span>' : 
            'শিক্ষক';
        const classText = isCoordinator ? 
            '<span style="color:rgba(255,255,255,0.4);font-style:italic;">কোন ক্লাস নেই</span>' : 
            (t.classes ? t.classes.map(c => c === 'SSC Special' ? '🎯 ' + c : c).join(', ') : '-');
        
        html += `<tr>
            <td><img src="${t.image || 'https://ui-avatars.com/api/?background=1e7b4a&color=fff&name=' + encodeURIComponent(t.name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
            <td>${t.name}</td>
            <td>${t.id}</td>
            <td>${classText}</td>
            <td>${roleText}</td>
            <td><button class="btn btn-red btn-sm" onclick="deleteTeacher('${key}')">মুছুন</button></td>
        </tr>`;
    }
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

window.deleteTeacher = function(key) {
    if (confirm('শিক্ষককে মুছতে চান?')) {
        db.ref('teachers/' + key).remove();
    }
};

// ============================================================
// POPULATE CLASS CHECKBOXES
// ============================================================
function populateClassCheckboxes() {
    const container = document.getElementById('classCheckboxes');
    if (!container) return;
    container.innerHTML = `
        <p style="font-size:13px; margin-bottom:8px; color:white;">
            <strong>ক্লাস নির্বাচন করুন:</strong> 
            <span style="font-size:11px; color:rgba(255,255,255,0.4);">(Office Coordinator হলে ক্লাস নির্বাচন না করলেও চলবে)</span>
        </p>
    `;
    allClasses.forEach(cls => {
        const displayName = cls === 'SSC Special' ? '🎯 ' + cls : cls;
        const label = document.createElement('label');
        label.style.cssText = 'display:inline-block; margin-right:12px; font-size:13px; color:rgba(255,255,255,0.8);';
        label.innerHTML = `<input type="checkbox" class="teacher-class-checkbox" value="${cls}"> ${displayName}`;
        container.appendChild(label);
    });
}

// ============================================================
// ADD TEACHER
// ============================================================
document.getElementById('createTeacherBtn').addEventListener('click', () => {
    const name = document.getElementById('newTeacherName').value.trim();
    const id = document.getElementById('newTeacherId').value.trim();
    const password = document.getElementById('newTeacherPass').value.trim();
    const checkboxes = document.querySelectorAll('.teacher-class-checkbox:checked');
    const classes = Array.from(checkboxes).map(cb => cb.value);
    const isOfficeCoordinator = document.getElementById('isOfficeCoordinator').checked;
    
    if (!name || !id || !password) {
        alert('নাম, আইডি এবং পাসওয়ার্ড দিন');
        return;
    }
    
    if (!isOfficeCoordinator && classes.length === 0) {
        alert('কমপক্ষে একটি ক্লাস নির্বাচন করুন');
        return;
    }
    
    const newTeacher = {
        name: name,
        id: id,
        password: password,
        classes: isOfficeCoordinator ? [] : classes,
        image: document.getElementById('teacherImagePreview').src,
        isOfficeCoordinator: isOfficeCoordinator,
        role: isOfficeCoordinator ? 'Office Coordinator' : 'Teacher'
    };
    
    const newRef = db.ref('teachers').push();
    newRef.set(newTeacher).then(() => {
        document.getElementById('newTeacherName').value = '';
        document.getElementById('newTeacherId').value = '';
        document.getElementById('newTeacherPass').value = '';
        document.querySelectorAll('.teacher-class-checkbox:checked').forEach(cb => cb.checked = false);
        document.getElementById('isOfficeCoordinator').checked = false;
        alert('✅ শিক্ষক যোগ করা হয়েছে' + (isOfficeCoordinator ? ' (Office Coordinator)' : ''));
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
// RENDER TEACHER PROFILE
// ============================================================
function renderTeacherProfile(teacherData) {
    const container = document.getElementById('teacherProfileArea');
    if (!container) return;
    const isCoordinator = teacherData.isOfficeCoordinator || false;
    const coordinatorBadge = isCoordinator ? 
        '<span style="background:linear-gradient(135deg,#ffd700,#f5a623); color:#191970; padding:4px 18px; border-radius:30px; font-size:13px; font-weight:700; display:inline-block; margin-top:6px;"><i class="fas fa-user-tie"></i> Office Coordinator</span>' : '';
    
    const classDisplay = isCoordinator ? 
        '<p style="color:rgba(255,255,255,0.5); font-style:italic;">কোন ক্লাস নেই</p>' : 
        `<p style="color:rgba(255,255,255,0.8);"><strong>ক্লাস:</strong> ${teacherData.classes ? teacherData.classes.map(c => c === 'SSC Special' ? '🎯 SSC Special' : c).join(', ') : ''}</p>`;
    
    container.innerHTML = `
        <div style="display:flex; align-items:center; gap:20px; background:rgba(255,255,255,0.05); padding:20px; border-radius:20px; flex-wrap:wrap;">
            <img src="${teacherData.image || 'https://ui-avatars.com/api/?background=1e7b4a&color=fff&name=' + encodeURIComponent(teacherData.name)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #ffd700;">
            <div>
                <h3 style="border:none; padding:0; color:white; font-size:24px;">${teacherData.name}</h3>
                <p style="color:rgba(255,255,255,0.8);"><strong>আইডি:</strong> ${teacherData.id}</p>
                ${classDisplay}
                ${coordinatorBadge}
            </div>
        </div>
    `;
}

// ============================================================
// CLASS SELECTION - DROPDOWN
// ============================================================
function setupClassDropdown() {
    const dropdown = document.getElementById('classSelectDropdown');
    if (!dropdown) return;
    
    dropdown.addEventListener('change', function() {
        const selectedValue = this.value;
        if (selectedValue) {
            selectedClass = selectedValue;
            
            document.querySelectorAll('.class-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-class') === selectedValue) {
                    btn.classList.add('active');
                }
            });
            
            document.getElementById('selectedClassName').textContent = 
                selectedValue === 'SSC Special' ? '🎯 ' + selectedValue : selectedValue;
            
            renderClassStudents(selectedValue);
            toggleGroupField(selectedValue);
        }
    });
}

// ============================================================
// CLASS BUTTONS
// ============================================================
function renderClassButtons() {
    const container = document.getElementById('classButtons');
    if (!container) return;
    container.innerHTML = '<div class="class-buttons-container">';
    
    allClasses.forEach(cls => {
        const btn = document.createElement('button');
        btn.className = 'class-btn' + (selectedClass === cls ? ' active' : '');
        btn.textContent = cls === 'SSC Special' ? '🎯 ' + cls : cls;
        btn.setAttribute('data-class', cls);
        
        btn.onclick = function() {
            selectedClass = cls;
            
            document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const dropdown = document.getElementById('classSelectDropdown');
            if (dropdown) dropdown.value = cls;
            
            document.getElementById('selectedClassName').textContent = 
                cls === 'SSC Special' ? '🎯 ' + cls : cls;
            
            renderClassStudents(cls);
            toggleGroupField(cls);
        };
        
        container.appendChild(btn);
    });
    container.innerHTML += '</div>';
    
    setupClassDropdown();
    
    if (!selectedClass) {
        const firstBtn = container.querySelector('.class-btn');
        if (firstBtn) firstBtn.click();
    }
}

// ============================================================
// CLASS STUDENTS
// ============================================================
function renderClassStudents(className) {
    const container = document.getElementById('classStudentsTable');
    if (!container) return;
    if (!className) {
        container.innerHTML = '<p class="empty-state">ক্লাস নির্বাচন করুন</p>';
        return;
    }
    const students = {};
    for (let key in allStudents) {
        if (allStudents[key].class === className) {
            students[key] = allStudents[key];
        }
    }
    if (Object.keys(students).length === 0) {
        container.innerHTML = '<p class="empty-state">এই ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>';
        return;
    }
    let html = `<div class="table-responsive"><table><thead><tr><th>ছবি</th><th>নাম</th><th>আইডি</th><th>ক্লাস</th><th>গ্রুপ</th><th>অভিভাবকের মোবাইল</th><th>অ্যাকশন</th></tr></thead><tbody>`;
    for (let key in students) {
        const s = students[key];
        let groupBadge = '-';
        if (s.group && isGroupRequired(className)) {
            const icon = GROUP_ICONS[s.group] || '';
            if (className === 'SSC Special') {
                groupBadge = `<span class="ssc-special-badge">🎯 ${icon} ${s.group}</span>`;
            } else {
                groupBadge = `<span class="student-group-tag ${s.group.toLowerCase()}">${icon} ${s.group}</span>`;
            }
        }
        html += `<tr>
            <td><img src="${s.image || 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=' + encodeURIComponent(s.name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
            <td>${s.name}</td>
            <td>${s.id}</td>
            <td>${s.class === 'SSC Special' ? '🎯 SSC Special' : s.class}</td>
            <td>${groupBadge}</td>
            <td>${s.guardianPhone || ''}</td>
            <td><button class="btn btn-red btn-sm" onclick="deleteStudent('${key}')">মুছুন</button></td>
        </tr>`;
    }
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

window.deleteStudent = function(key) {
    if (confirm('ছাত্র/ছাত্রীকে মুছতে চান?')) {
        db.ref('students/' + key).remove();
    }
};

// ============================================================
// ADD STUDENT
// ============================================================
document.getElementById('addCousinBtn').addEventListener('click', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('cousinName').value.trim();
    const id = document.getElementById('cousinId').value.trim();
    const password = document.getElementById('cousinPass').value.trim();
    const group = document.getElementById('cousinGroup').value;
    const guardianPhone = document.getElementById('cousinGuardianPhone').value.trim();
    
    if (!name || !id || !password) {
        alert('⚠️ নাম, আইডি এবং পাসওয়ার্ড দিন');
        return;
    }
    
    if (!selectedClass) {
        alert('⚠️ দয়া করে একটি ক্লাস নির্বাচন করুন!');
        const dropdown = document.getElementById('classSelectDropdown');
        if (dropdown) {
            dropdown.focus();
            dropdown.style.borderColor = '#ffd700';
            setTimeout(() => {
                dropdown.style.borderColor = 'rgba(255,215,0,0.3)';
            }, 2000);
        }
        return;
    }
    
    if (isGroupRequired(selectedClass) && !group) {
        alert(`⚠️ ${selectedClass} শ্রেণির জন্য গ্রুপ নির্বাচন আবশ্যক!`);
        document.getElementById('cousinGroup').focus();
        return;
    }
    
    const newStudent = {
        name: name,
        id: id,
        password: password,
        class: selectedClass,
        group: group || '',
        guardianPhone: guardianPhone || '',
        image: document.getElementById('studentImagePreview').src || 
               'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=' + encodeURIComponent(name)
    };
    
    const newRef = db.ref('students').push();
    newRef.set(newStudent)
        .then(() => {
            document.getElementById('cousinName').value = '';
            document.getElementById('cousinId').value = '';
            document.getElementById('cousinPass').value = '';
            document.getElementById('cousinGroup').value = '';
            document.getElementById('cousinGuardianPhone').value = '';
            alert('✅ ছাত্র/ছাত্রী যোগ করা হয়েছে');
            renderClassStudents(selectedClass);
        })
        .catch((error) => {
            alert('❌ যোগ করতে সমস্যা: ' + error.message);
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
// ROUTINE FUNCTIONS
// ============================================================
function renderTodayTomorrowRoutine() {
    const container = document.getElementById('todayTomorrowRoutine');
    if (!container) return;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const today = new Date();
    const todayName = days[today.getDay()];
    const tomorrowName = days[(today.getDay() + 1) % 7];
    const todayBangla = banglaDays[today.getDay()];
    const tomorrowBangla = banglaDays[(today.getDay() + 1) % 7];
    
    let html = '<div class="routine-side-by-side">';
    
    html += `<div class="today-routine-card">
        <h3>📅 আজকের রুটিন (${todayBangla})</h3>`;
    let hasToday = false;
    if (allRoutines[todayName]) {
        const sortedKeys = Object.keys(allRoutines[todayName]).sort();
        for (let key of sortedKeys) {
            if (allRoutines[todayName][key] && allRoutines[todayName][key].trim() !== '') {
                let displayName = key;
                let groupName = '';
                let isSscSpecial = false;
                for (let g of GROUP_LIST) {
                    if (key.endsWith('_' + g)) {
                        displayName = key.replace('_' + g, '');
                        groupName = g;
                        break;
                    }
                }
                if (displayName === 'SSC Special') {
                    isSscSpecial = true;
                }
                const icon = GROUP_ICONS[groupName] || '';
                const groupDisplay = groupName ? 
                    ` <span class="routine-group-tag ${isSscSpecial ? 'ssc-special' : groupName.toLowerCase()}">${isSscSpecial ? '🎯 ' + icon + ' ' + groupName : icon + ' ' + groupName}</span>` : '';
                const classDisplay = isSscSpecial ? '🎯 ' + displayName : displayName;
                html += `<p><strong>${classDisplay}${groupDisplay}</strong> <span class="subject-name">${allRoutines[todayName][key]}</span></p>`;
                hasToday = true;
            }
        }
    }
    if (!hasToday) {
        html += `<div class="empty-routine"><i class="fas fa-calendar-times"></i>আজকের জন্য কোনো রুটিন নেই</div>`;
    }
    html += '</div>';
    
    html += `<div class="tomorrow-routine-card">
        <h3>🌅 আগামীকালের রুটিন (${tomorrowBangla})</h3>`;
    let hasTomorrow = false;
    if (allRoutines[tomorrowName]) {
        const sortedKeys = Object.keys(allRoutines[tomorrowName]).sort();
        for (let key of sortedKeys) {
            if (allRoutines[tomorrowName][key] && allRoutines[tomorrowName][key].trim() !== '') {
                let displayName = key;
                let groupName = '';
                let isSscSpecial = false;
                for (let g of GROUP_LIST) {
                    if (key.endsWith('_' + g)) {
                        displayName = key.replace('_' + g, '');
                        groupName = g;
                        break;
                    }
                }
                if (displayName === 'SSC Special') {
                    isSscSpecial = true;
                }
                const icon = GROUP_ICONS[groupName] || '';
                const groupDisplay = groupName ? 
                    ` <span class="routine-group-tag ${isSscSpecial ? 'ssc-special' : groupName.toLowerCase()}">${isSscSpecial ? '🎯 ' + icon + ' ' + groupName : icon + ' ' + groupName}</span>` : '';
                const classDisplay = isSscSpecial ? '🎯 ' + displayName : displayName;
                html += `<p><strong>${classDisplay}${groupDisplay}</strong> <span class="subject-name">${allRoutines[tomorrowName][key]}</span></p>`;
                hasTomorrow = true;
            }
        }
    }
    if (!hasTomorrow) {
        html += `<div class="empty-routine"><i class="fas fa-calendar-times"></i>আগামীকালের জন্য কোনো রুটিন নেই</div>`;
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
        <h4 style="margin-bottom:15px; color:white;">📝 ${className === 'SSC Special' ? '🎯 ' + className : className} - ${dayName} ${groupName ? '(' + getGroupDisplayName(groupName) + ')' : ''}</h4>`;
    
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
        html += `
            <p style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:12px;">
                <i class="fas fa-info-circle"></i> ⚠️ ${className === 'SSC Special' ? '🎯 SSC Special' : className} শ্রেণির প্রতিটি গ্রুপের জন্য আলাদা রুটিন দিন
            </p>
        `;
    } else {
        const currentValue = allRoutines[dayName] && allRoutines[dayName][className] ? allRoutines[dayName][className] : '';
        html += `
            <div style="display:flex; gap:10px; align-items:center; margin-top:10px;">
                <span style="font-weight:bold; min-width:60px; color:white;">বিষয়:</span>
                <input type="text" id="routineSingleInput" value="${currentValue}" placeholder="বিষয় লিখুন..." style="flex:1; margin-bottom:0; color:white;">
            </div>
        `;
        html += `
            <p style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:12px;">
                <i class="fas fa-info-circle"></i> গ্রুপ প্রয়োজন নেই
            </p>
        `;
    }
    
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
                const isSscSpecial = cls === 'SSC Special';
                html += `<tr style="${isActive ? 'background:rgba(255,215,0,0.05);' : ''}">
                    <td>${isSscSpecial ? '🎯 ' + cls : cls}</td>
                    <td><span class="${isSscSpecial ? 'ssc-special-badge' : 'student-group-tag ' + grp.toLowerCase()}">${isSscSpecial ? '🎯 ' + icon + ' ' + grp : icon + ' ' + grp}</span></td>
                    <td>${val}</td>
                </tr>`;
            });
        } else {
            const val = allRoutines[dayName] && allRoutines[dayName][cls] ? allRoutines[dayName][cls] : '-';
            const isActive = (cls === className && !groupName);
            html += `<tr style="${isActive ? 'background:rgba(255,215,0,0.05);' : ''}">
                <td>${cls}</td>
                <td>-</td>
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
    const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const today = new Date();
    const todayName = days[today.getDay()];

    let html = `<div class="table-responsive">
        <table class="routine-table">
            <thead>
                <tr>
                    <th>ক্লাস</th>
                    <th>গ্রুপ</th>`;

    days.forEach((day, index) => {
        const isToday = day === todayName;
        html += `<th style="${isToday ? 'color:#ffd700; font-weight:800;' : ''}">${banglaDays[index]}${isToday ? ' 📌' : ''}</th>`;
    });

    html += `</tr></thead><tbody>`;

    const sortedClasses = [...allClasses];
    sortedClasses.sort((a, b) => {
        if (a === 'SSC Special') return -1;
        if (b === 'SSC Special') return 1;
        return a.localeCompare(b);
    });

    sortedClasses.forEach(cls => {
        if (isGroupRequired(cls)) {
            GROUP_LIST.forEach(grp => {
                const key = cls + '_' + grp;
                const icon = GROUP_ICONS[grp] || '';
                const isSscSpecial = cls === 'SSC Special';
                const groupTagClass = isSscSpecial ? 'ssc-special' : grp.toLowerCase();
                
                html += `<tr><td><strong>${isSscSpecial ? '🎯 ' + cls : cls}</strong></td>
                    <td><span class="routine-group-tag ${groupTagClass}">${isSscSpecial ? '🎯 ' + icon + ' ' + grp : icon + ' ' + grp}</span></td>`;
                
                days.forEach(day => {
                    const val = allRoutines[day] && allRoutines[day][key] ? allRoutines[day][key] : '-';
                    const isToday = day === todayName;
                    html += `<td style="${isToday ? 'background:rgba(255,215,0,0.08); font-weight:600; color:#ffd700;' : ''}">${val}</td>`;
                });
                html += '</tr>';
            });
        } else {
            html += `<tr><td><strong>${cls}</strong></td><td>-</td>`;
            days.forEach(day => {
                const val = allRoutines[day] && allRoutines[day][cls] ? allRoutines[day][cls] : '-';
                const isToday = day === todayName;
                html += `<td style="${isToday ? 'background:rgba(255,215,0,0.08); font-weight:600; color:#ffd700;' : ''}">${val}</td>`;
            });
            html += '</tr>';
        }
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

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
    const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const today = new Date();
    const todayName = days[today.getDay()];
    const todayBangla = banglaDays[today.getDay()];
    
    let routineKey = className;
    if (groupName && isGroupRequired(className)) {
        routineKey = className + '_' + groupName;
    }
    
    const isSscSpecial = className === 'SSC Special';
    const classDisplay = isSscSpecial ? '🎯 SSC Special' : className;
    const groupDisplay = groupName && isGroupRequired(className) ? 
        (isSscSpecial ? 
            `<span class="routine-group-tag ssc-special">🎯 ${GROUP_ICONS[groupName] || ''} ${groupName}</span>` : 
            `<span class="routine-group-tag ${groupName.toLowerCase()}">${GROUP_ICONS[groupName] || ''} ${groupName}</span>`) : '';
    
    let html = `<div class="routine-header">
        <h3>📚 আমার রুটিন</h3>
        <span class="badge">${classDisplay} ${groupDisplay}</span>
    </div>
    <div style="margin-bottom:16px; color:rgba(255,255,255,0.6); font-size:15px;">
        <i class="fas fa-calendar-day"></i> আজ: ${todayBangla} (${todayName})
    </div>`;
    
    html += `<div class="table-responsive">
        <table class="routine-table">
            <thead>
                <tr>
                    <th style="width:40%;">দিন</th>
                    <th style="width:60%;">বিষয়</th>
                </tr>
            </thead>
            <tbody>`;
    
    let hasRoutine = false;
    let todaySubject = null;
    days.forEach((day, index) => {
        let subject = '-';
        if (allRoutines[day] && allRoutines[day][routineKey]) {
            subject = allRoutines[day][routineKey];
            if (subject.trim() !== '') {
                hasRoutine = true;
                if (day === todayName) {
                    todaySubject = subject;
                }
            }
        }
        const isToday = day === todayName;
        const banglaDay = banglaDays[index];
        html += `<tr class="${isToday ? 'today-row' : ''}">
            <td>${banglaDay} ${isToday ? ' 📌 (আজ)' : ''}</td>
            <td>${subject}</td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    
    if (!hasRoutine) {
        html = `<div class="empty-routine">
            <i class="fas fa-calendar-times"></i>
            <p>আপনার জন্য এখনো কোনো রুটিন যোগ করা হয়নি।</p>
            <p style="font-size:14px; opacity:0.6;">অফিসে যোগাযোগ করুন রুটিন পেতে।</p>
        </div>`;
    } else if (todaySubject && todaySubject !== '-') {
        html += `<div class="today-subject-alert">
            <i class="fas fa-bell"></i> 
            <strong>আজকের বিষয়:</strong> ${todaySubject}
        </div>`;
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
        option.textContent = cls === 'SSC Special' ? '🎯 ' + cls : cls;
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
        option.textContent = cls === 'SSC Special' ? '🎯 ' + cls : cls;
        classSelect.appendChild(option);
    });
    if (selectedValue && allClasses.includes(selectedValue)) {
        classSelect.value = selectedValue;
    }
    
    selectedRoutineClass = classSelect.value;
}

// ============================================================
// ROUTINE SELECT CHANGES
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
// UI SETUP
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
    toggleGroupField(selectedClass);
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
    renderStudentOwnRoutine();
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
// TEACHER ASSIGNED CLASSES
// ============================================================
function renderTeacherAssignedClasses(teacherData) {
    const container = document.getElementById('teacherAssignedClasses');
    if (!container) return;
    const assignedClasses = teacherData.classes || [];
    if (assignedClasses.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">আপনার কোনো ক্লাস নেই</p>';
        return;
    }
    let html = '<h3 style="color:white;">আপনার ক্লাসসমূহ</h3><div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:16px;">';
    assignedClasses.forEach(cls => {
        const displayClass = cls === 'SSC Special' ? '🎯 SSC Special' : cls;
        html += `<span style="background:#ffd700; color:#191970; padding:8px 20px; border-radius:30px; font-weight:bold;">${displayClass}</span>`;
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
        container.innerHTML = `<p style="color:rgba(255,255,255,0.5);">${className === 'SSC Special' ? '🎯 SSC Special' : className} ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>`;
        return;
    }
    let html = `<h3 style="color:white;">${className === 'SSC Special' ? '🎯 SSC Special' : className} ক্লাসের ছাত্র/ছাত্রী</h3><div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:12px;">`;
    for (let key in students) {
        const s = students[key];
        const icon = GROUP_ICONS[s.group] || '';
        const groupClass = s.group ? s.group.toLowerCase() : '';
        const isSscSpecial = s.class === 'SSC Special';
        html += `<div style="background:rgba(255,255,255,0.05); padding:16px; border-radius:16px; text-align:center;">
            <img src="${s.image || 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=' + encodeURIComponent(s.name)}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid #ffd700;">
            <p style="margin-top:8px; color:white; font-weight:600;">${s.name}</p>
            <p style="font-size:12px; color:rgba(255,255,255,0.5);">${s.id}</p>
            ${s.group && isGroupRequired(s.class) ? `<p style="font-size:12px; margin-top:4px;"><span class="${isSscSpecial ? 'ssc-special-badge' : 'student-group-tag ' + groupClass}">${isSscSpecial ? '🎯 ' + icon + ' ' + s.group : icon + ' ' + s.group}</span></p>` : ''}
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// ============================================================
// STUDENT INFO
// ============================================================
function renderStudentInfo(studentData) {
    const card = document.getElementById('studentClassInfo');
    if (!card || !studentData) return;
    card.style.display = 'block';
    document.getElementById('studentNameDisplay').textContent = studentData.name;
    document.getElementById('studentClassDisplay').textContent = studentData.class === 'SSC Special' ? '🎯 SSC Special' : studentData.class;
    const icon = GROUP_ICONS[studentData.group] || '';
    document.getElementById('studentGroupDisplay').textContent = (studentData.group && studentData.class !== 'SSC Special') ? icon + ' ' + studentData.group : '-';
    document.getElementById('studentIdDisplay').textContent = studentData.id;
    
    renderStudentOwnRoutine();
}

// ============================================================
// ATTENDANCE
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
            if (className !== 'SSC Special' && groupName !== 'all' && student.group !== groupName) {
                continue;
            }
            students[key] = student;
        }
    }
    
    if (Object.keys(students).length === 0) {
        container.innerHTML = '<p class="empty-state">এই ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>';
        section.style.display = 'block';
        return;
    }
    
    let html = '';
    for (let key in students) {
        const student = students[key];
        const attKey = `${className}_${date}`;
        const isPresent = attendanceData[attKey] && attendanceData[attKey][key] === true;
        const icon = GROUP_ICONS[student.group] || '';
        const groupDisplay = (student.group && className !== 'SSC Special') ? '<span class="student-group-tag ' + student.group.toLowerCase() + '">' + icon + ' ' + student.group + '</span>' : '';
        const sscBadge = student.class === 'SSC Special' ? '<span class="ssc-special-badge">🎯 SSC</span>' : '';
        html += `<div class="student-att-row">
            <img src="${student.image || 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=' + encodeURIComponent(student.name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
            <span style="flex:1; color:white; font-weight:500;">${student.name} ${groupDisplay} ${sscBadge}</span>
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

// ============================================================
// STUDENT ATTENDANCE
// ============================================================
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
        <span style="font-weight:bold; color:white; font-size:18px;">${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
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

window.changeStudentMonth = function(delta) {
    studentMonthOffset += delta;
    renderStudentAttendance();
};

// ============================================================
// CLASS MONTHLY CALENDAR
// ============================================================
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
        <span style="font-weight:bold; color:white; font-size:18px;">${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} - ${className === 'SSC Special' ? '🎯 ' + className : className} ${groupName !== 'all' && className !== 'SSC Special' ? '(' + getGroupDisplayName(groupName) + ')' : ''}</span>
        <button class="btn btn-sm btn-blue" onclick="changeClassMonth(1)">▶</button>
    `;
    
    const students = {};
    for (let key in allStudents) {
        const student = allStudents[key];
        if (student.class === className) {
            if (className !== 'SSC Special' && groupName !== 'all' && student.group !== groupName) {
                continue;
            }
            students[key] = student;
        }
    }
    
    if (Object.keys(students).length === 0) {
        container.innerHTML = '<p class="empty-state">এই ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>';
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

window.changeClassMonth = function(delta) {
    classMonthOffset += delta;
    renderClassMonthlyCalendar();
};

// ============================================================
// FEEDBACK
// ============================================================
function renderStudentFeedbackArea() {
    const container = document.getElementById('studentFeedbackArea');
    if (!container) return;
    if (!currentUserKey || !allStudents[currentUserKey]) {
        container.innerHTML = '<p class="empty-state">আপনি লগইন করেননি</p>';
        return;
    }
    const student = allStudents[currentUserKey];
    const className = student.class;
    const icon = GROUP_ICONS[student.group] || '';
    let html = `<p style="margin-bottom:15px; color:white; font-size:16px;"><strong>আপনার ক্লাস:</strong> ${className === 'SSC Special' ? '🎯 SSC Special' : className} ${student.group && className !== 'SSC Special' ? '(' + icon + ' ' + student.group + ')' : ''}</p>
        <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:24px;">
            <textarea id="feedbackText" rows="4" placeholder="আপনার মতামত লিখুন..." style="width:100%; border-radius:16px; color:white; font-size:16px;"></textarea>
            <button class="btn btn-orange" onclick="submitFeedback()" style="margin-top:12px; padding:14px 30px; font-size:16px;"><i class="fas fa-paper-plane"></i> পাঠান</button>
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
    let html = '<h4 style="color:white; margin-bottom:12px;">আপনার মতামতসমূহ</h4>';
    let hasFeedback = false;
    for (let key in feedbackData) {
        const fb = feedbackData[key];
        if (fb.studentId === student.id) {
            hasFeedback = true;
            const icon = GROUP_ICONS[fb.group] || '';
            html += `<div class="feedback-item">
                <p style="color:white; font-size:16px;">${fb.text}</p>
                <p style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:4px;">${fb.date || ''} ${fb.group && fb.className !== 'SSC Special' ? '| ' + icon + ' ' + fb.group : ''}</p>
                <button class="delete-btn" onclick="deleteFeedback('${key}')">মুছুন</button>
            </div>`;
        }
    }
    if (!hasFeedback) {
        html += '<p class="empty-state">আপনার কোনো মতামত নেই</p>';
    }
    container.innerHTML = html;
}

window.submitFeedback = function() {
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
};

window.deleteFeedback = function(key) {
    if (confirm('মতামত মুছতে চান?')) {
        db.ref('feedback/' + key).remove();
    }
};

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
        const groupDisplay = (fb.group && fb.className !== 'SSC Special') ? ' - ' + icon + ' ' + fb.group : '';
        html += `<div class="feedback-item">
            <p style="color:white;"><strong>${fb.studentName}</strong> (${fb.className === 'SSC Special' ? '🎯 SSC Special' : fb.className}${groupDisplay})</p>
            <p style="color:white; font-size:16px;">${fb.text}</p>
            <p style="font-size:12px; color:rgba(255,255,255,0.5);">${fb.date || ''}</p>
            <button class="delete-btn" onclick="deleteFeedback('${key}')">মুছুন</button>
        </div>`;
    }
    if (count === 0) {
        html = '<p class="empty-state">কোনো মতামত নেই</p>';
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
    
    db.ref('feed').push(post).then(() => {
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
        container.innerHTML = '<p class="empty-state">কোনো পোস্ট নেই</p>';
        return;
    }
    let html = '';
    posts.forEach(post => {
        const p = post.data;
        const isOwner = p.user === currentUserKey || currentRole === 'admin';
        html += `<div class="social-card" id="post-${post.key}">
            ${isOwner ? `<button class="delete-post-btn" onclick="deletePost('${post.key}')">✕</button>` : ''}
            <p style="color:white; font-size:16px;"><strong>${p.userName || p.user}</strong> <span style="font-size:13px; color:rgba(255,255,255,0.5);">(${p.role || ''})</span></p>
            <p style="font-size:13px; color:rgba(255,255,255,0.5);">${p.date || ''}</p>
            <p style="margin:12px 0; color:white; font-size:16px;">${p.caption || ''}</p>
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin:12px 0;">
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
            <div id="comment-section-${post.key}" style="display:none; margin-top:12px;">
                <div id="comments-${post.key}">
                    ${renderComments(p.comments)}
                </div>
                <div style="display:flex; gap:10px; margin-top:10px;">
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
        html += `<div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:12px; margin-bottom:6px;">
            <strong style="color:white;">${c.userName || c.user}</strong> <span style="font-size:11px; color:rgba(255,255,255,0.5);">${c.date || ''}</span>
            <p style="margin:4px 0; color:white;">${c.text}</p>
        </div>`;
    }
    return html;
}

window.toggleComment = function(postKey) {
    const section = document.getElementById(`comment-section-${postKey}`);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
};

window.addComment = function(postKey) {
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
    db.ref(`feed/${postKey}/comments`).push(comment).then(() => {
        input.value = '';
    }).catch((error) => {
        alert('❌ মন্তব্য করতে সমস্যা হয়েছে: ' + error.message);
    });
};

window.likePost = function(postKey) {
    if (!currentUserKey) {
        alert('আপনি লগইন করেননি');
        return;
    }
    const postRef = db.ref(`feed/${postKey}`);
    postRef.once('value', (snapshot) => {
        const currentData = snapshot.val();
        if (!currentData) return;
        if (!currentData.likedBy) currentData.likedBy = {};
        if (!currentData.likes) currentData.likes = 0;
        if (currentData.likedBy[currentUserKey]) {
            delete currentData.likedBy[currentUserKey];
            currentData.likes--;
        } else {
            currentData.likedBy[currentUserKey] = true;
            currentData.likes++;
        }
        postRef.set(currentData);
    });
};

window.deletePost = function(postKey) {
    if (confirm('পোস্ট মুছতে চান?')) {
        db.ref('feed/' + postKey).remove();
    }
};

// ============================================================
// VIEW BUTTONS
// ============================================================
document.getElementById('viewRoutineBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const routineSection = document.getElementById('fullRoutineDisplay');
    if (routineSection) {
        routineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        routineSection.style.transition = 'box-shadow 0.5s ease';
        routineSection.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.2)';
        setTimeout(() => {
            routineSection.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
        }, 1500);
    }
    renderFullRoutine();
});

document.getElementById('viewResultBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('resultModal').style.display = 'flex';
});

document.getElementById('aboutUsBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('aboutModal').style.display = 'flex';
});

document.getElementById('saveClassBtn')?.addEventListener('click', () => {
    alert('✅ সব তথ্য ইতিমধ্যে Firebase এ অটো-সেভ আছে।');
});

document.getElementById('saveAllRoutinesBtn')?.addEventListener('click', () => {
    alert('✅ সব রুটিন ইতিমধ্যে অটো-সেভ হয়েছে।');
});

// ============================================================
// INITIALIZE
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    animateLoginGloriousText();
    animateBismillah();
    
    const hasSession = checkSession();
    if (!hasSession) {
        loginScreen.style.display = 'flex';
    }
});

