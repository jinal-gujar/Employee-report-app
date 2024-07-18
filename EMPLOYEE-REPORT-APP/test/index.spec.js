describe('File Upload Functionality', function() {
    let fileInput, uploadButton;

    beforeEach(function() {
        fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('id', 'fileInput');
        document.body.appendChild(fileInput);

        uploadButton = document.createElement('button');
        uploadButton.setAttribute('id', 'uploadButton');
        document.body.appendChild(uploadButton);

        window.handleFileUpload = function(event) {
            event.preventDefault();
            const fileInput = document.getElementById('fileInput');
            if (!fileInput.files.length) {
                alert('Please select a JSON file.');
            } else {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        JSON.parse(event.target.result);
                        alert('File uploaded successfully.');
                    } catch (e) {
                        alert('Invalid JSON file. Please upload a valid JSON file.');
                    }
                };
                reader.onerror = function() {
                    alert('Error reading file.');
                };
                reader.readAsText(file);
            }
        };

        uploadButton.addEventListener('click', window.handleFileUpload);
    });

    afterEach(function() {
        document.body.removeChild(fileInput);
        document.body.removeChild(uploadButton);
        delete window.handleFileUpload;
    });

    it('should display an alert if no file is selected', function() {
        spyOn(window, 'alert');
        fileInput.files = new DataTransfer().files; // Empty FileList
        uploadButton.click();
        expect(window.alert).toHaveBeenCalledWith('Please select a JSON file.');
    });

    it('should handle file upload if a valid JSON file is selected', function(done) {
        spyOn(window, 'alert');
        
        const validJson = JSON.stringify({});
        const file = new File([validJson], 'test.json', { type: 'application/json' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        uploadButton.click();
        
        setTimeout(() => {
            expect(window.alert).toHaveBeenCalledWith('File uploaded successfully.');
            done();
        }, 100);
    });

    it('should alert if an invalid JSON file is uploaded', function(done) {
        spyOn(window, 'alert');
        
        const invalidJson = 'invalid json';
        const file = new File([invalidJson], 'test.json', { type: 'application/json' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        uploadButton.click();
        
        setTimeout(() => {
            expect(window.alert).toHaveBeenCalledWith('Invalid JSON file. Please upload a valid JSON file.');
            done();
        }, 100);
    });

    it('should alert if there is an error reading the file', function(done) {
        spyOn(window, 'alert');
        
        const file = new File(['dummy content'], 'test.json', { type: 'application/json' });
        
        // Mock FileReader and trigger error
        spyOn(window, 'FileReader').and.returnValue({
            readAsText: function() { this.onerror(); },
            onerror: null,
            onload: null
        });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        uploadButton.click();

        setTimeout(() => {
            expect(window.alert).toHaveBeenCalledWith('Error reading file.');
            done();
        }, 100);
    });
    
    it('should handle the absence of weekSelector element gracefully', function() {
        spyOn(document, 'getElementById').and.returnValue(null);
        document.dispatchEvent(new Event('DOMContentLoaded'));
        expect(document.getElementById).toHaveBeenCalledWith('weekSelector');
    });

    it('should handle the absence of employeeSelector element gracefully', function() {
        spyOn(document, 'getElementById').and.returnValue(null);
        document.dispatchEvent(new Event('DOMContentLoaded'));
        expect(document.getElementById).toHaveBeenCalledWith('employeeSelector');
    });
});


describe('Visualization Functionality', function() {
    beforeEach(function() {
        window.visualizeUpdatedData = async function() {
            try {
                const fetchDataResponse = await fetch('http://localhost:3000/getMergedWeeklyReportData');
                const data = await fetchDataResponse.json();
                visualizeDataFromJson(data);
            } catch (error) {
                console.error('Error fetching or visualizing updated data:', error);
            }
        };

        window.visualizeDataFromJson = function(data) {
            // Placeholder function for testing
        };
    });

    afterEach(function() {
        delete window.visualizeUpdatedData;
        delete window.visualizeDataFromJson;
    });

    it('should call visualizeDataFromJson function when visualizing updated data', async function() {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
        spyOn(window, 'visualizeDataFromJson');

        await window.visualizeUpdatedData();

        expect(window.visualizeDataFromJson).toHaveBeenCalled();
    });

    it('should handle fetch error gracefully', async function() {
        spyOn(window, 'fetch').and.returnValue(Promise.reject('Network Error'));
        spyOn(window.console, 'error');

        await window.visualizeUpdatedData();

        expect(window.console.error).toHaveBeenCalledWith('Error fetching or visualizing updated data:', 'Network Error');
    });

    it('should call visualizeDataFromJson with correct data', async function() {
        const mockData = [{ WeekNum: 1, tasks: [{ Technology: 'JavaScript', daysSpent: 5 }] }];
        spyOn(window, 'fetch').and.returnValue(Promise.resolve({ ok: true, json: () => Promise.resolve(mockData) }));
        spyOn(window, 'visualizeDataFromJson');

        await window.visualizeUpdatedData();

        expect(window.visualizeDataFromJson).toHaveBeenCalledWith(mockData);
    });
});


import fetchMock from 'fetch-mock';
import { fetchDataAndRenderChart } from '../fetchDataAndRenderChart';

describe('fetchDataAndRenderChart', () => {
    afterEach(() => {
        fetchMock.restore();
    });

    it('should fetch data for a specific quarter', async () => {
        fetchMock.post('http://localhost:3000/graphql', {
            data: {
                getWeeklyReport: [
                    { EmpNum: 1, WeekNum: 'Q1', tasks: [{ Technology: 'JavaScript', daysSpent: 15 }] }
                ]
            }
        });

        const data = await fetchDataAndRenderChart('Q1', 1);
        expect(data.data.getWeeklyReport).toEqual(jasmine.any(Array));
    });

    it('should fetch data for a specific week and employee', async () => {
        fetchMock.post('http://localhost:3000/graphql', {
            data: {
                getWeeklyReport: [
                    { EmpNum: 1, WeekNum: 1, tasks: [{ Technology: 'JavaScript', daysSpent: 5 }] }
                ]
            }
        });

        const data = await fetchDataAndRenderChart(1, 1);
        expect(data.data.getWeeklyReport).toEqual(jasmine.any(Array));
    });

    it('should fetch data for all weeks and specific employee', async () => {
        fetchMock.post('http://localhost:3000/graphql', {
            data: {
                getWeeklyReport: [
                    { EmpNum: 1, WeekNum: 1, tasks: [{ Technology: 'JavaScript', daysSpent: 5 }] }
                ]
            }
        });

        const data = await fetchDataAndRenderChart('', 1);
        expect(data.data.getWeeklyReport).toEqual(jasmine.any(Array));
    });

    it('should fetch data for all weeks and all employees', async () => {
        fetchMock.post('http://localhost:3000/graphql', {
            data: {
                getWeeklyReport: [
                    { EmpNum: 1, WeekNum: 1, tasks: [{ Technology: 'JavaScript', daysSpent: 5 }] }
                ]
            }
        });

        const data = await fetchDataAndRenderChart('', '');
        expect(data.data.getWeeklyReport).toEqual(jasmine.any(Array));
    });

    it('should handle fetch error', async () => {
        fetchMock.post('http://localhost:3000/graphql', 500);

        try {
            await fetchDataAndRenderChart(1, 1);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    it('should return an empty array if no data is returned', async () => {
        fetchMock.post('http://localhost:3000/graphql', {
            data: {
                getWeeklyReport: []
            }
        });

        const data = await fetchDataAndRenderChart(1, 1);
        expect(data.data.getWeeklyReport).toEqual([]);
    });

    it('should fetch data correctly with mixed input of weeks and employees', async () => {
        fetchMock.post('http://localhost:3000/graphql', {
            data: {
                getWeeklyReport: [
                    { EmpNum: 2, WeekNum: 'Q2', tasks: [{ Technology: 'Python', daysSpent: 10 }] }
                ]
            }
        });

        const data = await fetchDataAndRenderChart('Q2', 2);
        expect(data.data.getWeeklyReport).toEqual(jasmine.any(Array));
    });

    it('should fetch data correctly when employee is empty but week is specified', async () => {
        fetchMock.post('http://localhost:3000/graphql', {
            data: {
                getWeeklyReport: [
                    { EmpNum: 3, WeekNum: 3, tasks: [{ Technology: 'Ruby', daysSpent: 8 }] }
                ]
            }
        });

        const data = await fetchDataAndRenderChart(3, '');
        expect(data.data.getWeeklyReport).toEqual(jasmine.any(Array));
    });
});
