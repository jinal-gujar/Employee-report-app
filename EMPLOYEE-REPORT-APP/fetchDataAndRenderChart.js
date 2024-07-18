async function fetchDataAndRenderChart(selectedWeek, selectedEmployee) {
    let query;
    if (['Q1', 'Q2', 'Q3', 'Q4'].includes(selectedWeek)) {
        query = `query {
            getWeeklyReport(quarter: "${selectedWeek}"${selectedEmployee ? `, empId: ${selectedEmployee}` : ''}) {
                EmpNum
                WeekNum
                tasks {
                    Technology
                    taskName
                    startDate
                    endDate
                    daysSpent
            }
        }`;
    } else if (selectedWeek !== '' && !isNaN(selectedWeek)) {
        query = `query {
            getWeeklyReport(weekNum: ${selectedWeek}${selectedEmployee ? `, empId: ${selectedEmployee}` : ''}) {
                EmpNum
                WeekNum
                tasks {
                    Technology
                    taskName
                    startDate
                    endDate
                    daysSpent
                }
            }
        }`;
    } else {
        query = `query {
            getWeeklyReport(${selectedEmployee ? `empId: ${selectedEmployee}` : ''}) {
                EmpNum
                WeekNum
                tasks {
                    Technology
                    taskName
                    startDate
                    endDate
                    daysSpent
                }
            }
        }`;
    }
    const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query }),
    });
    return response.json();
}


module.exports = { fetchDataAndRenderChart };



