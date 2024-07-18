const maxWeeks = 52; // Set your desired maximum number of weeks
const maxEmployees = 10; // Set your desired maximum number of employees

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('weekSelector')) {
        // Populate week/month dropdown dynamically
        const weekSelector = document.getElementById('weekSelector');
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        for (let week = 1; week <= maxWeeks; week++) {
            const option = document.createElement('option');
            option.value = week;
            option.text = `Week ${week}`;
            weekSelector.appendChild(option);
        }

        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = month;
            option.text = month;
            weekSelector.appendChild(option);
        });

        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

        for (let quarterIndex = 0; quarterIndex < quarters.length; quarterIndex++) {
            const quarter = quarters[quarterIndex];
            const quarterOption = document.createElement('option');
            quarterOption.value = quarter;
            quarterOption.text = quarter;
            weekSelector.appendChild(quarterOption);
        }
    }

    if (document.getElementById('employeeSelector')) {
        for (let emp = 1; emp <= maxEmployees; emp++) {
            const option = document.createElement('option');
            option.value = emp;
            option.text = `Emp ${emp}`;
            document.getElementById('employeeSelector').appendChild(option);
        }

        const allEmployeesOption = document.createElement('option');
        allEmployeesOption.value = ''; 
        allEmployeesOption.text = 'All Employees';
        document.getElementById('employeeSelector').appendChild(allEmployeesOption);
    }
});

function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        const selectedFile = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
            const fileContent = event.target.result;
            try {
                const jsonData = JSON.parse(fileContent);
                visualizeDataFromJson(jsonData);
            } catch (error) {
                console.error('Error parsing JSON file:', error.message);
                alert('Invalid JSON file. Please upload a valid JSON file.');
            }
        };
        reader.readAsText(selectedFile);
    } else {
        alert('Please select a JSON file.');
    }
}

function visualizeDataFromJson(jsonData) {
    const technologies = [...new Set(jsonData.flatMap(report => report.tasks.map(task => task.Technology)))];
    const datasets = jsonData.map((report) => ({
        label: `Week ${report.WeekNum}`,
        data: report.tasks.map(task => task.daysSpent),
        backgroundColor: report.tasks.map(() => `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`),
        borderWidth: 1,
    }));

    const chartCanvas = document.getElementById('visualizationChart');
    if (window.myChart) {
        window.myChart.destroy();
    }

    const ctx = chartCanvas.getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: technologies,
            datasets: datasets,
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Technology' }, stacked: true },
                y: { title: { display: true, text: 'Days Spent' }, stacked: true },
            },
            maintainAspectRatio: true,
            responsive: true,
            aspectRatio: 2.5,
        },
    });
}

async function uploadAndFetchData(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        try {
            const response = await fetch('http://localhost:3000/uploadAndMergeWeeklyReportData', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                alert('Weekly report data updated successfully');
                const fetchDataResponse = await fetch('http://localhost:3000/getMergedWeeklyReportData');
                const data = await fetchDataResponse.json();
                const resultContainer = document.getElementById('resultContainer');
                resultContainer.innerText = JSON.stringify(data, null, 2);
            } else {
                console.error('Failed to upload the file.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        alert('Please select a JSON file.');
    }
}

async function visualizeUpdatedData() {
    try {
        const fetchDataResponse = await fetch('http://localhost:3000/getMergedWeeklyReportData');
        const data = await fetchDataResponse.json();
        visualizeDataFromJson(data);
    } catch (error) {
        console.error('Error fetching or visualizing updated data:', error);
    }
}

window.uploadAndFetchData = uploadAndFetchData;
window.visualizeUpdatedData = visualizeUpdatedData;
window.handleFileUpload = handleFileUpload;
window.visualizeDataFromJson = visualizeDataFromJson;
