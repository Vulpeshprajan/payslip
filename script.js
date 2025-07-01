document.getElementById('timesheetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('employeeName').value;
    const start = document.getElementById('payPeriodStart').value;
    const end = document.getElementById('payPeriodEnd').value;
    const payPeriod = start && end ? `${start} to ${end}` : '';
    const rate = parseFloat(document.getElementById('baseRate').value) || 0;

    // Helper to get week data with shift penalty
    function getWeekData(suffix) {
        return [
            { label: 'Monday',    hours: parseFloat(document.getElementById('mon'+suffix).value) || 0, night: document.getElementById('monNight'+suffix).checked },
            { label: 'Tuesday',   hours: parseFloat(document.getElementById('tue'+suffix).value) || 0, night: document.getElementById('tueNight'+suffix).checked },
            { label: 'Wednesday', hours: parseFloat(document.getElementById('wed'+suffix).value) || 0, night: document.getElementById('wedNight'+suffix).checked },
            { label: 'Thursday',  hours: parseFloat(document.getElementById('thu'+suffix).value) || 0, night: document.getElementById('thuNight'+suffix).checked },
            { label: 'Friday',    hours: parseFloat(document.getElementById('fri'+suffix).value) || 0, night: document.getElementById('friNight'+suffix).checked },
            { label: 'Saturday',  hours: parseFloat(document.getElementById('sat'+suffix).value) || 0, night: document.getElementById('satNight'+suffix).checked },
            { label: 'Sunday',    hours: parseFloat(document.getElementById('sun'+suffix).value) || 0, night: document.getElementById('sunNight'+suffix).checked }
        ];
    }

    // Combine both weeks
    const week1 = getWeekData('1');
    const week2 = getWeekData('2');

    // Weekday (Mon-Fri) calculations
    let weekdayHours = 0, weekdayPay = 0;
    for (let i = 0; i < 5; i++) {
        const totalHours = week1[i].hours + week2[i].hours;
        const nightHours = (week1[i].night ? week1[i].hours : 0) + (week2[i].night ? week2[i].hours : 0);
        const normalHours = totalHours - nightHours;
        weekdayHours += totalHours;
        weekdayPay += normalHours * rate + nightHours * rate * 1.25;
    }

    // Saturday
    const saturdayHours = week1[5].hours + week2[5].hours;
    const saturdayPay = saturdayHours * rate * 1.5;

    // Sunday
    const sundayHours = week1[6].hours + week2[6].hours;
    const sundayPay = sundayHours * rate * 2.0;

    const totalPay = weekdayPay + saturdayPay + sundayPay;

    // Build table rows
    let rows = '';
    rows += `<tr>
        <td>Weekdays (Mon-Fri)</td>
        <td>${weekdayHours % 1 === 0 ? weekdayHours : weekdayHours.toFixed(2)}</td>
        <td>25% if shift</td>
        <td>$${rate.toFixed(2)}</td>
        <td>$${weekdayPay.toFixed(2)}</td>
    </tr>`;
    rows += `<tr>
        <td>Saturday</td>
        <td>${saturdayHours % 1 === 0 ? saturdayHours : saturdayHours.toFixed(2)}</td>
        <td>150%</td>
        <td>$${rate.toFixed(2)}</td>
        <td>$${saturdayPay.toFixed(2)}</td>
    </tr>`;
    rows += `<tr>
        <td>Sunday</td>
        <td>${sundayHours % 1 === 0 ? sundayHours : sundayHours.toFixed(2)}</td>
        <td>200%</td>
        <td>$${rate.toFixed(2)}</td>
        <td>$${sundayPay.toFixed(2)}</td>
    </tr>`;

    document.getElementById('payslipResult').innerHTML = `
        <h2>Payslip (Fortnightly)</h2>
        <div><strong>Employee:</strong> ${name}</div>
        <div><strong>Pay Period:</strong> ${payPeriod}</div>
        <table>
            <tr>
                <th>Day(s)</th>
                <th>Total Hours Worked</th>
                <th>Penalty Rate</th>
                <th>Base Rate</th>
                <th>Total Amount</th>
            </tr>
            ${rows}
            <tr class="totals-row">
                <td><strong>Total</strong></td>
                <td><strong>${(weekdayHours + saturdayHours + sundayHours) % 1 === 0 ? (weekdayHours + saturdayHours + sundayHours) : (weekdayHours + saturdayHours + sundayHours).toFixed(2)}</strong></td>
                <td></td>
                <td></td>
                <td><strong>$${totalPay.toFixed(2)}</strong></td>
            </tr>
        </table>
    `;

    // Animation: fade in payslip
    const payslipDiv = document.getElementById('payslipResult');
    payslipDiv.classList.remove('visible');
    void payslipDiv.offsetWidth; // trigger reflow
    payslipDiv.classList.add('visible');

    // Show print button
    document.getElementById('printPayslip').style.display = 'inline-block';
});

// Print/Export to PDF functionality
document.getElementById('printPayslip').addEventListener('click', function() {
    // Only print the payslip area
    const payslipContent = document.getElementById('payslipResult').innerHTML;
    const win = window.open('', '', 'width=900,height=700');
    win.document.write(`
        <html>
        <head>
            <title>Payslip</title>
            <link rel="stylesheet" href="style.css">
            <style>
                body { background: #fff; margin: 0; padding: 24px; }
                .print-btn { display: none !important; }
            </style>
        </head>
        <body>
            <div class="container">${payslipContent}</div>
        </body>
        </html>
    `);
    win.document.close();
    setTimeout(() => {
        win.print();
        win.close();
    }, 500);
});