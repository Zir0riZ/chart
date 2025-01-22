async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        let htmlContent = '';
        for (const [semester, courses] of Object.entries(data)) {
            if (semester.startsWith('نیمسال')) {
                htmlContent += `<div class="semester-title">${semester}</div>`;
                htmlContent += `<table>
                    <thead>
                        <tr>
                            <th>ردیف</th>
                            <th>شماره درس</th>
                            <th>نام درس</th>
                            <th>نوع درس</th>
                            <th>تعداد واحد</th>
                            <th>نوع واحد</th>
                            <th>پیش نیاز</th>
                            <th>همنیاز</th>
                            <th>وضعیت</th>
                        </tr>
                    </thead>
                    <tbody>`;
                courses.forEach(course => {
                    htmlContent += `<tr>
                        <td>${course.ردیف}</td>
                        <td>${course["شماره درس"]}</td>
                        <td>${course["نام درس"]}</td>
                        <td>${course["نوع درس"]}</td>
                        <td>${course["تعداد واحد"]}</td>
                        <td>${course["نوع واحد"]}</td>
                        <td>${course["پیش نیاز"]}</td>
                        <td>${course["همنیاز"]}</td>
                        <td><input type="checkbox" ${course.وضعیت ? 'checked' : ''}></td>
                    </tr>`;
                });

                htmlContent += `</tbody></table>`;
            }
        }
        document.getElementById('data-container').innerHTML = htmlContent;
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('click', function() {
                const row = this.closest('tr');
                const unit = parseInt(row.querySelector('td:nth-child(5)').textContent);
                const type = row.querySelector('td:nth-child(4)').textContent;
                updateUnitSummary(type, unit, this.checked);
                if (this.checked) {
                    row.classList.add('highlight');
                } else {
                    row.classList.remove('highlight');
                }
                updateRemainingCourses();
            });
        });
        updateRemainingCourses();
    } catch (error) {
        console.error('خطا در بارگذاری داده‌ها:', error);
    }
}
function updateUnitSummary(type, unit, isChecked) {
    const row = document.getElementById(getRowId(type));
    if (!row) return;

    const passedUnitsCell = row.querySelector('td:nth-child(3)');
    const remainingUnitsCell = row.querySelector('td:nth-child(4)');

    let passedUnits = parseInt(passedUnitsCell.textContent);
    let remainingUnits = parseInt(remainingUnitsCell.textContent);

    if (isChecked) {
        passedUnits += unit;
        remainingUnits -= unit;
    } else {
        passedUnits -= unit;
        remainingUnits += unit;
    }

    passedUnitsCell.textContent = passedUnits;
    remainingUnitsCell.textContent = remainingUnits;

    updateTotal();
}

function updateTotal() {
    const rows = document.querySelectorAll('#unit-summary tbody tr:not(#total)');
    let totalPassed = 0;
    let totalRemaining = 0;

    rows.forEach(row => {
        totalPassed += parseInt(row.querySelector('td:nth-child(3)').textContent);
        totalRemaining += parseInt(row.querySelector('td:nth-child(4)').textContent);
    });

    const totalRow = document.getElementById('total');
    totalRow.querySelector('td:nth-child(3)').textContent = totalPassed;
    totalRow.querySelector('td:nth-child(4)').textContent = totalRemaining;
}

function updateRemainingCourses() {
    const remainingCoursesTable = document.querySelector('#remaining-courses tbody');
    remainingCoursesTable.innerHTML = '';

    const allRows = document.querySelectorAll('#data-container table tbody tr');
    allRows.forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (!checkbox.checked) {
            const cells = row.querySelectorAll('td');
            const newRow = document.createElement('tr');
            cells.forEach((cell, index) => {
                if (index !== 8) { 
                    const newCell = document.createElement('td');
                    newCell.textContent = cell.textContent;
                    newRow.appendChild(newCell);
                }
            });
            remainingCoursesTable.appendChild(newRow);
        }
    });
}

function getRowId(type) {
    switch (type) {
        case 'عمومی': return 'general';
        case 'پایه': return 'basic';
        case 'اصلی': return 'main';
        case 'تخصصی': return 'specialized';
        case 'اختیاری': return 'elective';
        default: return '';
    }
}

loadData();