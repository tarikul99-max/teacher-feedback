
const firebaseConfig = {
  apiKey: "AIzaSyDgMdQnck6n4zCKgy7MOwsiW4_6CbgYoL0",
  authDomain: "playingsite-8bd07.firebaseapp.com",
  databaseURL: "https://playingsite-8bd07-default-rtdb.firebaseio.com",
  projectId: "playingsite-8bd07",
  storageBucket: "playingsite-8bd07.firebasestorage.app",
  messagingSenderId: "765554474404",
  appId: "1:765554474404:web:94c496cb2d5bdf138dd531",
  measurementId: "G-DYMKZBSFQ8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ============================================================
// GLOBAL VARIABLES
// ============================================================

let subjects = [], students = [], rolls = [], writtenMarks = {}, mcqMarks = {};
let writtenFullMarks = {}, mcqFullMarks = {}, subjectExamType = {}, studentOptional = {};
let examsList = [], isAdmin = false, loggedInStudent = null;
let saveTimer = null;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function updateStudentGroupVisibility() {
    let cls = document.getElementById('studentClassSelect').value;
    let groupSelect = document.getElementById('studentGroup');
    if(cls === '5' || cls === '6' || cls === '7' || cls === '8') {
        groupSelect.style.display = 'none';
    } else {
        groupSelect.style.display = 'flex';
    }
}

function showToast() { 
    let t = document.getElementById('autoSaveToast'); 
    t.style.opacity = '1'; 
    setTimeout(() => t.style.opacity = '0', 1200); 
}

function limitName(n) { 
    return n && n.length > 35 ? n.substring(0,35) : (n||''); 
}

function getGPA(p) { 
    if(p>=80) return 5.00; 
    if(p>=70) return 4.00; 
    if(p>=60) return 3.50; 
    if(p>=50) return 3.00; 
    if(p>=40) return 2.00; 
    if(p>=33) return 1.00; 
    return 0.00; 
}

function getGrade(p) { 
    let g=getGPA(p); 
    if(g>=5) return 'A+'; 
    if(g>=4) return 'A'; 
    if(g>=3.5) return 'A-'; 
    if(g>=3) return 'B'; 
    if(g>=2) return 'C'; 
    if(g>=1) return 'D'; 
    return 'F'; 
}

function isSubPass(w,m,idx) { 
    let t=subjectExamType[idx]||'both', wF=writtenFullMarks[idx]||70, mF=mcqFullMarks[idx]||30; 
    if(t==='written') return w>=wF*0.33; 
    if(t==='mcq') return m>=mF*0.33; 
    return (w>=wF*0.33 && m>=mF*0.33); 
}

function getSubTotal(s,sub) { 
    let w=+(writtenMarks[`${s}_${sub}`]||0), m=+(mcqMarks[`${s}_${sub}`]||0), wF=writtenFullMarks[sub]||70, mF=mcqFullMarks[sub]||30, t=subjectExamType[sub]||'both'; 
    return { total: t==='written'?w:(t==='mcq'?m:w+m), full: t==='written'?wF:(t==='mcq'?mF:wF+mF), w, m }; 
}

// ============================================================
// AUTO SAVE
// ============================================================

function autoSave() { 
    if(!isAdmin) return; 
    if(saveTimer) clearTimeout(saveTimer); 
    saveTimer = setTimeout(() => { 
        let exam=document.getElementById('eSel').value; 
        if(!exam) return; 
        let c=document.getElementById('cSel').value, g=document.getElementById('gSel').value, path=`results/${c}_${g}_${exam}`.replace(/\s+/g,'_'); 
        db.ref(path).set({ subjects, students, rolls, writtenMarks, mcqMarks, writtenFullMarks, mcqFullMarks, subjectExamType, studentOptional }).then(()=>showToast()).catch(e=>console.warn); 
    }, 700); 
}

// ============================================================
// PATH & DATA LOADING
// ============================================================

function getPath(exam=null) { 
    let c=document.getElementById('cSel').value, e=exam||document.getElementById('eSel').value, g=document.getElementById('gSel').value; 
    return `results/${c}_${g}_${e}`.replace(/\s+/g,'_'); 
}

function changeClass() {
    let cls = document.getElementById('cSel').value;
    let groupSelect = document.getElementById('gSel');
    if(cls === '5' || cls === '6' || cls === '7' || cls === '8') {
        groupSelect.style.display = 'none';
        groupSelect.value = 'Science';
    } else {
        groupSelect.style.display = 'flex';
    }
    loadExamsForClass(cls, document.getElementById('gSel').value);
}

function changeGroup() { 
    loadExamsForClass(document.getElementById('cSel').value, document.getElementById('gSel').value); 
}

function loadExamsForClass(c,g) {
    document.getElementById('vClass').innerText = c;
    document.getElementById('loadingMsg').style.display='block';
    db.ref(`exams_list_per_class/${c}_${g}`).once('value', snap=>{
        examsList = snap.val()||[];
        let eSel=document.getElementById('eSel'), copySel=document.getElementById('copyExamSelect'), stuExam=document.getElementById('studentExam');
        let opts = examsList.map(e=>`<option value="${e}">${e}</option>`).join('');
        eSel.innerHTML = opts; 
        copySel.innerHTML = '<option value="">-- সিলেক্ট --</option>'+examsList.map(e=>`<option value="${e}">${e}</option>`).join('');
        stuExam.innerHTML = '<option value="">-- পরীক্ষা --</option>'+opts;
        if(examsList.length) { 
            eSel.value = examsList[0]; 
            updateInfo(); 
        } else { 
            subjects=[]; students=[]; rolls=[]; writtenMarks={}; mcqMarks={}; render(); 
            document.getElementById('loadingMsg').style.display='none'; 
        }
    }).catch(()=>{ 
        document.getElementById('loadingMsg').style.display='none'; 
        alert("লোডিং ব্যর্থ"); 
    });
}

function updateInfo() {
    let exam=document.getElementById('eSel').value; 
    if(!exam) return;
    document.getElementById('vExam').innerText=exam; 
    document.getElementById('vGroup').innerText=document.getElementById('gSel').value;
    document.getElementById('loadingMsg').style.display='block';
    db.ref(getPath()).once('value', snap=>{
        let d=snap.val()||{};
        subjects = d.subjects||[];
        students = (d.students||[]).map(limitName);
        rolls = d.rolls||[];
        writtenMarks = d.writtenMarks||{};
        mcqMarks = d.mcqMarks||{};
        writtenFullMarks = d.writtenFullMarks||{};
        mcqFullMarks = d.mcqFullMarks||{};
        subjectExamType = d.subjectExamType||{};
        studentOptional = d.studentOptional||{};
        render();
        document.getElementById('loadingMsg').style.display='none';
    }).catch(()=>{ 
        document.getElementById('loadingMsg').style.display='none'; 
        alert("ডাটা লোড ব্যর্থ"); 
    });
}

// ============================================================
// EXAM NAME EDIT
// ============================================================

function editExamName() {
    if(!isAdmin) return;
    let oldName = document.getElementById('eSel').value;
    let newName = document.getElementById('examNameEdit').value.trim();
    if(!oldName || !newName) return alert("পুরাতন ও নতুন নাম দিন");
    if(oldName === newName) return alert("নাম একই");
    let c = document.getElementById('cSel').value, g = document.getElementById('gSel').value;
    let oldPath = `results/${c}_${g}_${oldName}`.replace(/\s+/g,'_');
    let newPath = `results/${c}_${g}_${newName}`.replace(/\s+/g,'_');
    db.ref(oldPath).once('value', snap=>{
        let data = snap.val();
        if(!data) return alert("পুরাতন পরীক্ষার ডাটা নেই");
        db.ref(newPath).set(data).then(()=>{
            db.ref(`exams_list_per_class/${c}_${g}`).once('value', snap2=>{
                let list = snap2.val()||[];
                let idx = list.indexOf(oldName);
                if(idx !== -1) list[idx] = newName;
                else list.push(newName);
                db.ref(`exams_list_per_class/${c}_${g}`).set(list).then(()=>{
                    db.ref(oldPath).remove().then(()=>{
                        examsList = list;
                        updateExamDropdowns();
                        document.getElementById('eSel').value = newName;
                        document.getElementById('examNameEdit').value = '';
                        updateInfo();
                        alert("পরীক্ষার নাম পরিবর্তন করা হয়েছে!");
                    });
                });
            });
        });
    });
}

// ============================================================
// MARK UPDATE FUNCTIONS
// ============================================================

function updateExamType(sub, type) { 
    if(!isAdmin) return; 
    subjectExamType[sub] = type; 
    render(); 
    autoSave(); 
}

function updateWrittenMark(s,sub,val) { 
    if(!isAdmin) return; 
    let max=writtenFullMarks[sub]||70; 
    let v=Math.min(parseFloat(val)||0, max); 
    writtenMarks[`${s}_${sub}`]=v; 
    updateSingleCellDisplay(s,sub); 
    calcAndRank(); 
    autoSave(); 
}

function updateMcqMark(s,sub,val) { 
    if(!isAdmin) return; 
    let max=mcqFullMarks[sub]||30; 
    let v=Math.min(parseFloat(val)||0, max); 
    mcqMarks[`${s}_${sub}`]=v; 
    updateSingleCellDisplay(s,sub); 
    calcAndRank(); 
    autoSave(); 
}

function updateSingleCellDisplay(s,sub) { 
    let row = document.querySelector(`#tBody tr:nth-child(${s+1})`); 
    if(!row) return; 
    let cell = row.cells[sub+2]; 
    if(!cell) return; 
    let wVal=+(writtenMarks[`${s}_${sub}`]||0), mVal=+(mcqMarks[`${s}_${sub}`]||0); 
    let wF=writtenFullMarks[sub]||70, mF=mcqFullMarks[sub]||30, type=subjectExamType[sub]||'both'; 
    let subTotal = type==='written'?wVal:(type==='mcq'?mVal:wVal+mVal); 
    let subFull = type==='written'?wF:(type==='mcq'?mF:wF+mF); 
    let totalDiv = cell.querySelector('.total-mark-display'); 
    if(totalDiv) totalDiv.innerText = `প্রাপ্ত: ${subTotal}/${subFull}`; 
}

// ============================================================
// CALCULATE AND RANK
// ============================================================

function calcAndRank() {
    let rows = document.querySelectorAll('#tBody tr');
    let allData = [];
    for(let s=0; s<rows.length; s++) {
        let row = rows[s];
        let totalObt=0, totalFull=0, normalGPA=[], bonus=0, hasFail=false;
        for(let sub=0; sub<subjects.length; sub++) {
            let {total, full, w, m} = getSubTotal(s,sub);
            totalObt+=total; totalFull+=full;
            let percent = full? (total/full)*100 : 0;
            let gpa = getGPA(percent);
            let pass = isSubPass(w,m,sub);
            if(!pass) hasFail=true;
            let isOpt = !!studentOptional[`${s}_${sub}`];
            if(isOpt && gpa>0) bonus += Math.max(0, gpa-2.00);
            else normalGPA.push(gpa);
        }
        let avg = (normalGPA.reduce((a,b)=>a+b,0)+bonus)/(normalGPA.length||1);
        let finalGPA = hasFail? 0 : Math.min(5.00, avg);
        let totalPercent = totalFull? (totalObt/totalFull)*100 : 0;
        if(row.querySelector('.r-total')) row.querySelector('.r-total').innerText = `${totalObt}/${totalFull}`;
        if(row.querySelector('.r-pct')) row.querySelector('.r-pct').innerText = Math.round(totalPercent)+'%';
        if(row.querySelector('.r-gpa')) row.querySelector('.r-gpa').innerHTML = `<span class="gpa-badge">${finalGPA.toFixed(2)} (${getGrade(totalPercent)})</span>`;
        if(row.querySelector('.r-res')) row.querySelector('.r-res').innerHTML = hasFail ? '<span class="status-badge fail">ফেল</span>' : '<span class="status-badge pass">পাস</span>';
        allData.push({idx:s, total:totalObt, hasFail, name:students[s]||''});
    }
    let sorted = [...allData].sort((a,b)=>b.total - a.total);
    allData.forEach(d=>{ 
        let rank = sorted.findIndex(x=>x.total===d.total)+1; 
        let row = rows[d.idx]; 
        if(row && row.querySelector('.r-pos')) row.querySelector('.r-pos').innerHTML = `<span style="font-weight:800; background:#c8e6c9; padding:4px 8px; border-radius:20px; display:inline-block;">${rank}</span>`; 
    });
    let top = allData.filter(d=>!d.hasFail && d.total>0).sort((a,b)=>b.total - a.total).slice(0,10);
    if(top.length) {
        document.getElementById('topHoldersBox').style.display='block';
        let items = top.map((r,i)=>{ 
            let medal = i<3? ['🥇 1st','🥈 2nd','🥉 3rd'][i] : `${i+1}th`; 
            return `<div class="rank-item"><span>${medal}</span><span><strong>${limitName(r.name).substring(0,30)}</strong> (${r.total})</span></div>`; 
        });
        let mid = Math.ceil(items.length/2);
        document.getElementById('topList').innerHTML = `<div class="merit-column">${items.slice(0,mid).join('')}</div><div class="merit-column">${items.slice(mid).join('')}</div>`;
    } else document.getElementById('topHoldersBox').style.display='none';
}

// ============================================================
// TOGGLE OPTIONAL
// ============================================================

function toggleOptional(s, sub) {
    if(!isAdmin) return;
    let key = `${s}_${sub}`;
    studentOptional[key] = !studentOptional[key];
    let row = document.querySelector(`#tBody tr:nth-child(${s+1})`);
    if(row) {
        let cell = row.cells[sub+2];
        let optDiv = cell.querySelector('.optional-checkbox');
        if(optDiv) {
            let chk = optDiv.querySelector('input');
            if(chk) chk.checked = studentOptional[key];
            if(studentOptional[key]) optDiv.classList.add('selected');
            else optDiv.classList.remove('selected');
        }
    }
    calcAndRank();
    autoSave();
}

// ============================================================
// TOGGLE COLUMNS - Also handles print visibility
// ============================================================

function toggleCols() {
    let total = document.getElementById('chkTotal').checked;
    let pct = document.getElementById('chkPct').checked;
    let gpa = document.getElementById('chkGPA').checked;
    let res = document.getElementById('chkRes').checked;
    let pos = document.getElementById('chkPos').checked;

    // Get the table wrap element to add/remove classes
    const tableWrap = document.getElementById('resultTableWrap');
    if (!tableWrap) return;

    // Remove all column hidden classes
    tableWrap.classList.remove('col-hidden-total', 'col-hidden-pct', 'col-hidden-gpa', 'col-hidden-res', 'col-hidden-pos');

    // Add classes based on checkbox state
    if (!total) tableWrap.classList.add('col-hidden-total');
    if (!pct) tableWrap.classList.add('col-hidden-pct');
    if (!gpa) tableWrap.classList.add('col-hidden-gpa');
    if (!res) tableWrap.classList.add('col-hidden-res');
    if (!pos) tableWrap.classList.add('col-hidden-pos');

    // Also handle individual cell visibility for screen
    document.querySelectorAll('#hRow th.cell-total').forEach(el => el.style.display = total ? '' : 'none');
    document.querySelectorAll('#hRow th.cell-pct').forEach(el => el.style.display = pct ? '' : 'none');
    document.querySelectorAll('#hRow th.cell-gpa').forEach(el => el.style.display = gpa ? '' : 'none');
    document.querySelectorAll('#hRow th.cell-res').forEach(el => el.style.display = res ? '' : 'none');
    document.querySelectorAll('#hRow th.cell-pos').forEach(el => el.style.display = pos ? '' : 'none');

    document.querySelectorAll('#tBody td.cell-total, #tBody td.r-total').forEach(el => el.style.display = total ? '' : 'none');
    document.querySelectorAll('#tBody td.cell-pct, #tBody td.r-pct').forEach(el => el.style.display = pct ? '' : 'none');
    document.querySelectorAll('#tBody td.cell-gpa, #tBody td.r-gpa').forEach(el => el.style.display = gpa ? '' : 'none');
    document.querySelectorAll('#tBody td.cell-res, #tBody td.r-res').forEach(el => el.style.display = res ? '' : 'none');
    document.querySelectorAll('#tBody td.cell-pos, #tBody td.r-pos').forEach(el => el.style.display = pos ? '' : 'none');
}

// ============================================================
// RENDER FUNCTION
// ============================================================

function render() {
    if(loggedInStudent) { 
        document.getElementById('resultTableWrap').style.display='none'; 
        return; 
    }
    document.getElementById('resultTableWrap').style.display='block';
    
    let head = `<th style="width:60px;">Roll</th><th style="min-width:220px; width:auto;">Student Name</th>`;
    for(let i=0; i<subjects.length; i++) {
        let s = subjects[i];
        let wF=writtenFullMarks[i]||70, mF=mcqFullMarks[i]||30, type=subjectExamType[i]||'both';
        let totalFull = (type==='written'?wF : (type==='mcq'?mF : wF+mF));
        head += `<th><div class="subject-header">
            <textarea class="subject-name-input" rows="2" onblur="editSubjectName(${i}, this.value)" ${isAdmin?'':'disabled'}>${s.replace(/</g,'&lt;')}</textarea>
            <div class="mark-distribution">`;
        if(type !== 'mcq') head += `<span>✍️ <input type="number" value="${wF}" onchange="updateWrittenFull(${i}, this.value)" ${isAdmin?'':'disabled'} style="width:40px;"></span>`;
        if(type !== 'written') head += `<span>📝 <input type="number" value="${mF}" onchange="updateMcqFull(${i}, this.value)" ${isAdmin?'':'disabled'} style="width:40px;"></span>`;
        head += `</div>
            <select class="exam-type-selector" onchange="updateExamType(${i}, this.value)" ${isAdmin?'':'disabled'}>
                <option value="both" ${type==='both'?'selected':''}>Both (Written+MCQ)</option>
                <option value="written" ${type==='written'?'selected':''}>শুধু Written</option>
                <option value="mcq" ${type==='mcq'?'selected':''}>শুধু MCQ</option>
            </select>
            <div class="subject-total-badge">মোট: ${totalFull}</div>
            <span class="btn-del" onclick="delSub(${i})">✖</span>
        </div></th>`;
    }
    head += `<th class="cell-total" style="background:#1b1b3b; color:white;">মোট</th><th class="cell-pct" style="background:#1b1b3b,; color:white;">%</th><th class="cell-gpa" style="background:#1b1b3b,; color:white;">GPA</th><th class="cell-res" style="background:#1b1b3b; color:white;">ফলাফল</th><th class="cell-pos" style="background:#1b1b3b; color:white;">মেধা</th>`;
    document.getElementById('hRow').innerHTML = head;

    let body = '';
    for(let s=0; s<students.length; s++) {
        let name=limitName(students[s]||''), roll=rolls[s]||(s+1);
        body += `<tr>`;
        body += `<td><input type="number" class="roll-input" value="${roll}" onchange="updateStudentRoll(${s}, this.value)" ${isAdmin?'':'disabled'}></td>`;
        body += `<td><input type="text" class="stu-name-input" value="${name}" maxlength="35" placeholder="ছাত্রের পুরো নাম" onchange="updateStudentName(${s}, this.value)" ${isAdmin?'':'disabled'}><span class="btn-del" onclick="delStu(${s})">✖</span></td>`;
        for(let sub=0; sub<subjects.length; sub++) {
            let wVal=+(writtenMarks[`${s}_${sub}`]||0), mVal=+(mcqMarks[`${s}_${sub}`]||0);
            let wF=writtenFullMarks[sub]||70, mF=mcqFullMarks[sub]||30, type=subjectExamType[sub]||'both';
            let subTotal = type==='written'?wVal : (type==='mcq'?mVal : wVal+mVal);
            let subFull = type==='written'?wF : (type==='mcq'?mF : wF+mF);
            let isOpt = !!studentOptional[`${s}_${sub}`];
            let inputsHtml = '';
            if(type === 'written') inputsHtml = `<input type="number" class="written-input" value="${wVal}" oninput="updateWrittenMark(${s}, ${sub}, this.value)" ${isAdmin?'':'disabled'} placeholder="Written" style="width:60px;">`;
            else if(type === 'mcq') inputsHtml = `<input type="number" class="mcq-input" value="${mVal}" oninput="updateMcqMark(${s}, ${sub}, this.value)" ${isAdmin?'':'disabled'} placeholder="MCQ" style="width:60px;">`;
            else inputsHtml = `<div style="display:flex; gap:3px; justify-content:center; flex-wrap:wrap;"><input type="number" class="written-input" value="${wVal}" oninput="updateWrittenMark(${s}, ${sub}, this.value)" ${isAdmin?'':'disabled'} placeholder="Written" style="width:50px;"><input type="number" class="mcq-input" value="${mVal}" oninput="updateMcqMark(${s}, ${sub}, this.value)" ${isAdmin?'':'disabled'} placeholder="MCQ" style="width:50px;"></div>`;
            let optClass = isOpt ? 'optional-checkbox selected' : 'optional-checkbox';
            body += `<td>
                ${inputsHtml}
                <div class="${optClass}" onclick="toggleOptional(${s}, ${sub})"><input type="checkbox" ${isOpt?'checked':''} ${isAdmin?'':'disabled'} onclick="event.stopPropagation()"> <span>৪র্থ</span></div>
                <div class="total-mark-display">প্রাপ্ত: ${subTotal}/${subFull}</div>
            </td>`;
        }
        body += `<td class="r-total cell-total">-</td><td class="r-pct cell-pct">-</td><td class="r-gpa cell-gpa">-</td><td class="r-res cell-res">-</td><td class="r-pos cell-pos">-</td></tr>`;
    }
    document.getElementById('tBody').innerHTML = body;
    calcAndRank();
    toggleCols();
}

// ============================================================
// STUDENT MANAGEMENT FUNCTIONS
// ============================================================

function updateStudentRoll(i,v) { 
    if(!isAdmin) return; 
    rolls[i]=parseInt(v)||(i+1); 
    render(); 
    autoSave(); 
}

function updateStudentName(i,v) { 
    if(!isAdmin) return; 
    students[i]=limitName(v); 
    render(); 
    autoSave(); 
}

function editSubjectName(i,v) { 
    if(!isAdmin) return; 
    if(v.trim()) subjects[i]=v.trim(); 
    render(); 
    autoSave(); 
}

function updateWrittenFull(i,v) { 
    if(!isAdmin) return; 
    writtenFullMarks[i]=parseFloat(v)||70; 
    render(); 
    autoSave(); 
}

function updateMcqFull(i,v) { 
    if(!isAdmin) return; 
    mcqFullMarks[i]=parseFloat(v)||30; 
    render(); 
    autoSave(); 
}

function addSub() { 
    if(isAdmin && document.getElementById('subInp').value.trim()) { 
        subjects.push(document.getElementById('subInp').value.trim()); 
        render(); 
        autoSave(); 
        document.getElementById('subInp').value=''; 
    } 
}

function addStu() { 
    if(isAdmin && document.getElementById('nameInp').value.trim()) { 
        students.push(limitName(document.getElementById('nameInp').value.trim())); 
        rolls.push(students.length); 
        render(); 
        autoSave(); 
        document.getElementById('nameInp').value=''; 
    } 
}

function delSub(i) { 
    if(isAdmin && confirm("সাবজেক্ট মুছবেন?")) { 
        subjects.splice(i,1); 
        render(); 
        autoSave(); 
    } 
}

function delStu(i) { 
    if(isAdmin && confirm("ছাত্র মুছবেন?")) { 
        students.splice(i,1); 
        rolls.splice(i,1); 
        render(); 
        autoSave(); 
    } 
}

function saveToCloud() { 
    if(isAdmin) { 
        db.ref(getPath()).set({ subjects, students, rolls, writtenMarks, mcqMarks, writtenFullMarks, mcqFullMarks, subjectExamType, studentOptional }).then(()=>alert("সংরক্ষিত!")); 
    } 
}

// ============================================================
// COPY STUDENTS FROM EXAM
// ============================================================

function copyStudentsFromExam() { 
    if(!isAdmin) return; 
    let src=document.getElementById('copyExamSelect').value, cur=document.getElementById('eSel').value; 
    if(!src) return alert("সোর্স সিলেক্ট করুন"); 
    if(src===cur) return alert("বর্তমান পরীক্ষা থেকে কপি করা যাবে না"); 
    let c=document.getElementById('cSel').value, g=document.getElementById('gSel').value; 
    db.ref(`results/${c}_${g}_${src}`.replace(/\s+/g,'_')).once('value', snap=>{ 
        let data=snap.val()||{}, stu=data.students||[], rl=data.rolls||[]; 
        if(!stu.length) return alert("ছাত্র নেই"); 
        if(confirm(`${stu.length} জন ছাত্র কপি করবেন?`)) { 
            db.ref(getPath()).once('value', tSnap=>{ 
                let td=tSnap.val()||{}; 
                td.students=[...stu]; 
                td.rolls=[...rl]; 
                if(!subjects.length && data.subjects) { 
                    td.subjects=data.subjects; 
                    td.writtenFullMarks=data.writtenFullMarks||{}; 
                    td.mcqFullMarks=data.mcqFullMarks||{}; 
                    td.subjectExamType=data.subjectExamType||{}; 
                    subjects=data.subjects; 
                    writtenFullMarks=data.writtenFullMarks||{}; 
                    mcqFullMarks=data.mcqFullMarks||{}; 
                    subjectExamType=data.subjectExamType||{}; 
                } 
                let nm={}; 
                for(let i=0;i<stu.length;i++) for(let j=0;j<subjects.length;j++) nm[`${i}_${j}`]=0; 
                td.writtenMarks=nm; 
                td.mcqMarks=nm; 
                td.studentOptional={}; 
                db.ref(getPath()).set(td).then(()=>{ 
                    students=stu; 
                    rolls=rl; 
                    writtenMarks=nm; 
                    mcqMarks=nm; 
                    studentOptional={}; 
                    render(); 
                    alert("কপি সম্পন্ন"); 
                }); 
            }); 
        } 
    }); 
}

// ============================================================
// RESET CURRENT PAGE DATA
// ============================================================

function resetCurrentPageData() { 
    if(!isAdmin) return; 
    if(confirm("সব ডাটা রিসেট করবেন? 'RESET' টাইপ করুন")) { 
        let cnf=prompt("নিশ্চিত করতে 'RESET' লিখুন"); 
        if(cnf==="RESET") db.ref(getPath()).remove().then(()=>{ 
            subjects=[]; 
            students=[]; 
            rolls=[]; 
            writtenMarks={}; 
            mcqMarks={}; 
            render(); 
            alert("রিসেট সম্পন্ন"); 
        }); 
    } 
}

// ============================================================
// ADD EXAM
// ============================================================

function addExam() { 
    if(!isAdmin) return; 
    let v=document.getElementById('examInp').value.trim(); 
    if(v && !examsList.includes(v)) { 
        let c=document.getElementById('cSel').value, g=document.getElementById('gSel').value; 
        db.ref(`exams_list_per_class/${c}_${g}`).once('value', snap=>{ 
            let list=snap.val()||[]; 
            list.push(v); 
            db.ref(`exams_list_per_class/${c}_${g}`).set(list).then(()=>{ 
                examsList=list; 
                updateExamDropdowns(); 
                document.getElementById('eSel').value=v; 
                updateInfo(); 
                document.getElementById('examInp').value=''; 
            }); 
        }); 
    } 
}

function updateExamDropdowns() { 
    let eSel=document.getElementById('eSel'), copySel=document.getElementById('copyExamSelect'), stuExam=document.getElementById('studentExam'); 
    let opts=examsList.map(e=>`<option value="${e}">${e}</option>`).join(''); 
    eSel.innerHTML=opts; 
    copySel.innerHTML='<option value="">-- সিলেক্ট --</option>'+examsList.map(e=>`<option value="${e}">${e}</option>`).join(''); 
    stuExam.innerHTML='<option value="">-- পরীক্ষা --</option>'+opts; 
}

// ============================================================
// STUDENT LOGIN
// ============================================================

function studentLogin() {
    let roll=parseInt(document.getElementById('studentRoll').value), name=document.getElementById('studentName').value.trim(), exam=document.getElementById('studentExam').value, grp=document.getElementById('studentGroup').value, cls=document.getElementById('studentClassSelect').value;
    if(!roll||!name||!exam) return alert("সব তথ্য দিন");
    let finalGroup = (cls === '5' || cls === '6' || cls === '7' || cls === '8') ? 'NoGroup' : grp;
    let path=`results/${cls}_${finalGroup}_${exam}`.replace(/\s+/g,'_');
    db.ref(path).once('value', snap=>{ 
        let d=snap.val()||{}, stu=d.students||[], rl=d.rolls||[], subs=d.subjects||[]; 
        let idx=-1; 
        for(let i=0;i<stu.length;i++) if(rl[i]===roll && stu[i]===name) { idx=i; break; } 
        if(idx===-1) return alert("রোল ও নাম মেলেনি!");
        let wMarks=d.writtenMarks||{}, mMarks=d.mcqMarks||{}, wFulls=d.writtenFullMarks||{}, mFulls=d.mcqFullMarks||{}, examType=d.subjectExamType||{}, opt=d.studentOptional||{}; 
        let totalObt=0, totalFull=0, normalGPA=[], bonus=0, fail=false, subDetails=[]; 
        for(let i=0;i<subs.length;i++){ 
            let w=+(wMarks[`${idx}_${i}`]||0), m=+(mMarks[`${idx}_${i}`]||0), wF=wFulls[i]||70, mF=mFulls[i]||30, type=examType[i]||'both', obt=type==='written'?w:(type==='mcq'?m:w+m), full=type==='written'?wF:(type==='mcq'?mF:wF+mF), pct=full?(obt/full)*100:0, gpa=getGPA(pct), pass=false; 
            if(type==='written') pass=w>=wF*0.33; 
            else if(type==='mcq') pass=m>=mF*0.33; 
            else pass=(w>=wF*0.33 && m>=mF*0.33); 
            if(!pass) fail=true; 
            let isOpt=!!opt[`${idx}_${i}`]; 
            if(isOpt && gpa>0) bonus+=Math.max(0,gpa-2); 
            else normalGPA.push(gpa); 
            totalObt+=obt; 
            totalFull+=full; 
            subDetails.push({ name:subs[i], written:w, mcq:m, wFull:wF, mFull:mF, type, obtained:obt, full, percent:Math.round(pct), pass, isOpt }); 
        } 
        let avg=(normalGPA.reduce((a,b)=>a+b,0)+bonus)/(normalGPA.length||1); 
        let finalGPA=fail?0:Math.min(5,avg); 
        let overallPct=totalFull?(totalObt/totalFull)*100:0; 
        let html=`<div class="exam-card"><div class="exam-title">📘 ${exam} (${cls})</div><table class="subject-table"><thead><tr><th>#</th><th>বিষয়</th>${subDetails.some(s=>s.type!=='mcq')?'<th>Written</th>':''}${subDetails.some(s=>s.type!=='written')?'<th>MCQ</th>':''}<th>মোট</th><th>৪র্থ?</th><th>ফলাফল</th></tr></thead><tbody>`; 
        subDetails.forEach((sub,idx)=>{ 
            html+=`<tr><td>${idx+1}</td><td style="text-align:left">${sub.name}</td>${sub.type!=='mcq'?`<td>${sub.written}/${sub.wFull}</td>`:''}${sub.type!=='written'?`<td>${sub.mcq}/${sub.mFull}</td>`:''}<td><strong>${sub.obtained}/${sub.full}</strong> (${sub.percent}%)</td><td>${sub.isOpt?'✅':'❌'}</td><td><span class="status-badge ${sub.pass?'pass':'fail'}">${sub.pass?'পাস':'ফেল'}</span></td></tr>`; 
        }); 
        html+=`</tbody></table><div class="exam-summary"><div>📊 মোট: ${totalObt}/${totalFull}</div><div>📈 শতকরা: ${Math.round(overallPct)}%</div><div>⭐ GPA: <span class="gpa-badge-sm">${finalGPA.toFixed(2)} (${getGrade(overallPct)})</span></div><div>🎯 ফলাফল: <span class="status-badge ${fail?'fail':'pass'}">${fail?'Fail':'Pass'}</span></div></div></div>`; 
        document.getElementById('studentOwnResult').innerHTML=html; 
        document.getElementById('studentLoginSection').style.display='none'; 
        document.getElementById('studentInfoCard').style.display='block'; 
        document.getElementById('adminControlsPanel').style.display='none'; 
        document.getElementById('resultTableWrap').style.display='none'; 
        document.getElementById('topHoldersBox').style.display='none'; 
        loggedInStudent={roll,name}; 
    }).catch(()=>alert("ফলাফল আনতে সমস্যা হয়েছে!")); 
}

// ============================================================
// STUDENT LOGOUT
// ============================================================

function studentLogout() { 
    loggedInStudent=null; 
    document.getElementById('studentLoginSection').style.display='block'; 
    document.getElementById('studentInfoCard').style.display='none'; 
    document.getElementById('adminControlsPanel').style.display='flex'; 
    document.getElementById('resultTableWrap').style.display='block'; 
    document.getElementById('topHoldersBox').style.display='block'; 
    render(); 
}

// ============================================================
// TOGGLE ADMIN
// ============================================================

function toggleAdmin() { 
    if(!isAdmin) { 
        let p=prompt("এডমিন পাসওয়ার্ড দিন:"); 
        if(p==="#$t") { 
            isAdmin=true; 
            document.body.classList.add('is-admin'); 
            document.getElementById('loginBtn').innerHTML='<i class="fas fa-sign-out-alt"></i> Logout Admin'; 
            if(loggedInStudent) studentLogout(); 
            updateExamDropdowns(); 
            render(); 
        } else if(p!==null) alert("ভুল পাসওয়ার্ড!"); 
    } else { 
        isAdmin=false; 
        document.body.classList.remove('is-admin'); 
        document.getElementById('loginBtn').innerHTML='<i class="fas fa-lock"></i> Admin Login'; 
        render(); 
    } 
}

// ============================================================
// GLORIOUS TEXT ROTATION - WAVE ROTATE FROM POSITION
// ============================================================

(function() {
    'use strict';

    function initGloriousText() {
        const textElement = document.getElementById('gloriousText');
        if (!textElement) return;

        if (textElement.dataset.initialized === 'true') return;
        textElement.dataset.initialized = 'true';

        const letters = textElement.querySelectorAll('.letter');
        const colors = ['#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#0ABDE3', '#10AC84', '#EE5A24', '#FF6B6B','#ee24c9', '#936bff'];
        const rotations = [20, -14, 8, -12, 14, -15, 16, -20, 15, -19];
        const translations = [-3, 2, -4, 1, -2, 3, -1, 2, -2, 3];

        letters.forEach((letter, index) => {
            if (index < colors.length) {
                letter.style.color = colors[index];
                letter.style.transform = `rotate(${rotations[index]}deg) translateY(${translations[index]}px)`;
                letter.style.transformOrigin = (index % 2 === 0) ? 'center bottom' : 'center top';
                letter.style.textShadow = `0 0 20px ${colors[index]}66`;
            }
        });
    }

    function updateRotationsForMobile() {
        const letters = document.querySelectorAll('.glorious-text .letter');
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;

        const desktopRotations = [20, -14, 8, -12, 14, -15, 16, -20, 15, -19];
        const tabletRotations = [10, -7, 5, -6, 7, -8, 8, -10, 7, -8];
        const mobileRotations = [5, -4, 3, -3, 4, -5, 5, -6, 4, -5];
        
        const desktopTranslations = [-3, 2, -4, 1, -2, 3, -1, 2, -2 ,3];
        const tabletTranslations = [-2, 1, -2, 1, -1, 2, -1, 1, -2, 1];
        const mobileTranslations = [-1, 1, -1, 0, -1, 1, 0, 1, -1, 1];

        let rotations, translations;

        if (isSmallMobile) {
            rotations = mobileRotations;
            translations = mobileTranslations;
        } else if (isMobile) {
            rotations = tabletRotations;
            translations = tabletTranslations;
        } else {
            rotations = desktopRotations;
            translations = desktopTranslations;
        }

        letters.forEach((letter, index) => {
            if (index < rotations.length) {
                letter.style.transform = `rotate(${rotations[index]}deg) translateY(${translations[index]}px)`;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGloriousText);
    } else {
        initGloriousText();
    }

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateRotationsForMobile();
        }, 200);
    });

    window.addEventListener('orientationchange', function() {
        setTimeout(updateRotationsForMobile, 300);
    });

})();

// ============================================================
// WINDOW ONLOAD
// ============================================================

window.onload = () => {
    changeClass();
    updateStudentGroupVisibility();
    // toggleCols is called from render()
};
