
document.addEventListener('DOMContentLoaded', function () {
    const weekSelector = document.getElementById('weekSelector');
    const employeeSelector = document.getElementById('employeeSelector');
    const quarterlySelectors = ['Q1', 'Q2', 'Q3', 'Q4']; // List of quarters
    const selectedEmployee = employeeSelector.value;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];



    
    // Add event listeners for the dropdowns
    weekSelector.addEventListener('change', fetchDataAndRenderChart);
    employeeSelector.addEventListener('change', fetchDataAndRenderChart);

    // Initial fetch and render on page load for week 1 and all employees
    fetchDataAndRenderChart();

// New function to fetch and render quarterly data
function fetchAndRenderQuarterlyData(selectedQuarter, selectedEmployee) {
    console.log('Selected Quarter:', selectedQuarter);
    
    
    // Define the mapping of quarters to weeks
    const quarterToWeeks = {
        Q1: { start: 1, end: 13 },
        Q2: { start: 14, end: 26 },
        Q3: { start: 27, end: 39 },
        Q4: { start: 40, end: 42 },
    };

    // Get the corresponding weeks for the selected quarter
    const { start, end } = quarterToWeeks[selectedQuarter];

    // Fetch and render data for each week in the quarter
    Promise.all(Array.from({ length: end - start + 1 }, (_, index) => start + index)
        .map(week => fetchAndAccumulateWeeklyData(selectedEmployee, week)))
        .then(quarterlyData => {
            // Process and save the quarterly data with replaced week numbers
            const dataForQuarter = quarterlyData.flat().map(entry => ({
                ...entry,
                WeekNum: selectedQuarter, // Use the selected quarter as the week number
            }));

            // Log the data to the console
            console.log('Data for the quarter:', dataForQuarter);

            // Render the quarterly chart
            renderChartQuarterly(dataForQuarter);
        })
        .catch(error => {
            console.error('Error fetching quarterly data:', error);
        });
}

// New function to fetch weekly data
async function fetchAndAccumulateWeeklyData(empId, week) {
    console.log('Selected Week:', week);

    const weeklyData = [];
     
    const query = `query ($week: Int, $empId: Int) {
        getWeeklyReport(weekNum: $week, empId: $empId) {
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

    // Perform the GraphQL request
    const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: { week: week, empId: parseInt(empId) }
        }),
    });

    // Parse the response
    const data = await response.json();

    // Check if the response has an 'errors' property
    if (data.errors) {
        throw new Error(data.errors[0].message);
    }

    // Log the actual data structure
    console.log('GraphQL Data:', data.data);

    // Accumulate data for the week
    weeklyData.push(...data.data.getWeeklyReport);

    return weeklyData;
}

// New function to render the Chart.js bar chart for quarterly data
function renderChartQuarterly(quarterlyData) {
    // Extract unique technologies
    const technologies = [...new Set(quarterlyData.flatMap(report => report.tasks.map(task => task.Technology)))];
    console.log('Quarterly Technologies:', technologies);

    // Create datasets for Chart.js
    const datasets = quarterlyData.map((report, index) => ({
        label: `Emp ${report.EmpNum}`,
        data: report.tasks.map(task => task.daysSpent),
        backgroundColor: report.tasks.map(() => `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`),
        borderWidth: 1,
    }));
    console.log('Quarterly Datasets:', datasets);

    // Get the canvas element for the quarterly chart
    const canvasQuarterly = document.getElementById('quarterlyReportChart');

    // Destroy the existing quarterly chart instance if it exists
    if (window.myChartQuarterly) {
        window.myChartQuarterly.destroy();
    }

    // Render the quarterly chart
    const ctxQuarterly = canvasQuarterly.getContext('2d');
    console.log('Quarterly Chart Data:', technologies, datasets);

    window.myChartQuarterly = new Chart(ctxQuarterly, {
        type: 'bar', // Set chart type to 'bar'
        data: {
            labels: technologies,
            datasets: datasets,
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Technology' }, stacked: true },
                y: { title: { display: true, text: 'Days Spent' }, stacked: true },
            },
            maintainAspectRatio: true, // Set to false to allow custom sizing
            responsive: true, // Set to true to allow responsiveness
            aspectRatio: 2.5,
        },
    });
}

function fetchDataAndRenderChart() {
    console.log('Fetching data and rendering chart...');
    const selectedWeek = weekSelector.value || 1;
    const selectedEmployee = employeeSelector.value;

    let query;
    // Check if the selected value is a quarter
    if (['Q1', 'Q2', 'Q3', 'Q4'].includes(selectedWeek)) {
        // Fetch quarterly report data
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
            }
        }`;
    } else if (selectedWeek !== '' && !isNaN(selectedWeek)) {
        // If a specific week is selected, fetch weekly report data
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
    } else if (selectedWeek !== '' && isNaN(selectedWeek)) {
        // If a month is selected without specifying an employee, fetch monthly report data for all employees
        query = `query {
            getWeeklyReport(month: "${selectedWeek}"${selectedEmployee ? `, empId: ${selectedEmployee}` : ''}) {
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
        // If neither quarter, week, nor month is selected, fetch all data
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
    // Fetch weekly report data for the specified week and employee
    fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('GraphQL Response:', data);

        // Check if the response has an 'errors' property
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        // Process data and create Chart.js bar chart for the weekly report
        const tasksData = data.data.getWeeklyReport || [];

        // Extract unique technologies
        const technologies = [...new Set(tasksData.flatMap(report => report.tasks.map(task => task.Technology)))];
        console.log('Technologies:', technologies);

        // Create datasets for Chart.js
        const datasets = tasksData.map((report, index) => ({
            label: `Emp ${report.EmpNum}`,
            data: report.tasks.map(task => task.daysSpent),
            backgroundColor: report.tasks.map(() => `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`),
            borderWidth: 1,
        }));
        console.log('Datasets:', datasets);

        // Render the chart using predefined data (for testing purposes)
        renderChart(technologies, datasets);
    })
    .catch(error => {
        console.error('GraphQL Request Error:', error.message);
        console.error('GraphQL Response Error:', JSON.stringify(error, null, 2));
    });
}
    
    // Function to render the Chart.js bar chart
    function renderChart(technologies, datasets) {
        // Get the canvas element
        const canvas = document.getElementById('weeklyReportChart');

        // Destroy the existing chart instance if it exists
        if (window.myChart) {
            window.myChart.destroy();
        }

        // Render the chart
        const ctx = canvas.getContext('2d');
        console.log('Chart Data:', technologies, datasets);

        window.myChart = new Chart(ctx, {
            type: 'bar', // Set chart type to 'bar'
            data: {
                labels: technologies,
                datasets: datasets,
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Technology' }, stacked: true },
                    y: { title: { display: true, text: 'Days Spent' }, stacked: true },
                },
                maintainAspectRatio: true, // Set to false to allow custom sizing
                responsive: true, // Set to true to allow responsiveness
                aspectRatio: 2.5,
            },
        });

        // Fetch and render monthly data
        fetchAndRenderMonthlyData();
        
    }

 // Function to fetch and render monthly data
function fetchAndRenderMonthlyData() {
    const selectedMonth = weekSelector.value; // Get the selected month value

    console.log('Selected Month:', selectedMonth);

    // Check if the selected month is a quarter
    if (quarterlySelectors.includes(selectedMonth)) {
        console.log('Selected Quarter:', selectedMonth);
        // Handle quarterly data separately
        fetchAndRenderQuarterlyData(selectedMonth, selectedEmployee);
        return;
    }

    // Check if selectedMonth is a valid month
    if (months.includes(selectedMonth)) {
        // Example usage for a specific employee and weeks range
        const selectedEmployee = employeeSelector.value;

        fetchAndAccumulateMonthlyData(selectedEmployee, selectedMonth)
            .then(monthlyData => {
                // Process and save the monthly data with replaced week numbers
                const dataForMonth = monthlyData.map(entry => ({
                    ...entry,
                    WeekNum: selectedMonth, // Use the selected month as the week number
                }));

                // Log the data to the console
                console.log('Data for the month:', dataForMonth);

                // Render the monthly chart
                renderChartMonthly(dataForMonth);
            })
            .catch(error => {
                console.error('Error fetching monthly data:', error);
            });
    } else {
        console.error('Invalid selected month:', selectedMonth);
    }
}

// Inside the fetchAndAccumulateMonthlyData function
async function fetchAndAccumulateMonthlyData(empId, selectedMonth) {
    const monthNumber = parseInt(selectedMonth); // Extract the month number

    console.log('Selected Month:', selectedMonth);

    const monthlyData = [];

    const query = `query ($month: String, $empId: Int) {
        getWeeklyReport(month: $month, empId: $empId) {
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

    // Perform the GraphQL request
    const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: { month: monthNumber, empId: parseInt(empId) }
        }),
    });

    // Parse the response
    const data = await response.json();

    // Check if the response has an 'errors' property
    if (data.errors) {
        throw new Error(data.errors[0].message);
    }

    // Log the actual data structure
    console.log('GraphQL Data:', data.data);

    // Accumulate data for the month
    monthlyData.push(...data.data.getWeeklyReport);

    return monthlyData;
}

    
   // Function to render the Chart.js bar chart for monthly data
function renderChartMonthly(monthlyData) {
    // Extract unique technologies
    const technologies = [...new Set(monthlyData.flatMap(report => report.tasks.map(task => task.Technology)))];
    console.log('Monthly Technologies:', technologies);

    // Create datasets for Chart.js
    const datasets = monthlyData.map(report => ({
        label: `Emp ${report.EmpNum}`,
        data: report.tasks.map(task => task.daysSpent),
        backgroundColor: report.tasks.map(() => `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`),
        borderWidth: 1,
    }));
    console.log('Monthly Datasets:', datasets);

    // Get the canvas element for the monthly chart
    const canvasMonthly = document.getElementById('monthlyReportChart');

    // Destroy the existing monthly chart instance if it exists
    if (window.myChartMonthly) {
        window.myChartMonthly.destroy();
    }

    // Render the monthly chart
    const ctxMonthly = canvasMonthly.getContext('2d');
    console.log('Monthly Chart Data:', technologies, datasets);

    window.myChartMonthly = new Chart(ctxMonthly, {
        type: 'bar', // Set chart type to 'bar'
        data: {
            labels: technologies,
            datasets: datasets,
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Technology' }, stacked: true },
                y: { title: { display: true, text: 'Days Spent' }, stacked: true },
            },
            maintainAspectRatio: true, // Set to false to allow custom sizing
            responsive: true, // Set to true to allow responsiveness
            aspectRatio: 2.5,
        },
    });
}
    fetchAndRenderQuarterlyData();



    module.exports = { fetchDataAndRenderChart,
        fetchAndRenderQuarterlyData,
        fetchAndAccumulateWeeklyData,
        renderChart,
        fetchAndRenderMonthlyData,
        fetchAndAccumulateMonthlyData,
        renderChartQuarterly,
        renderChartMonthly
     };
});

