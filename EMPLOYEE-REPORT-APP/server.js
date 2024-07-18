// server.js
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const express = require('express');
const multer = require('multer');

//const resolvers = require('./resolvers');

let weeklyReportData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'weeklyReportData.json')));
const filterDataByQuarterForAllEmployees = (quarter) => {
  console.log('Filtering by quarter for all employees...');

  let startWeek, endWeek;

  switch (quarter.toUpperCase()) {
    case 'Q1':
      startWeek = 1;
      endWeek = 13;
      break;
    case 'Q2':
      startWeek = 14;
      endWeek = 26;
      break;
    case 'Q3':
      startWeek = 27;
      endWeek = 39;
      break;
    case 'Q4':
      startWeek = 40;
      endWeek = 52;
      break;
    default:
      // Handle unexpected quarter
      console.log('Unexpected quarter:', quarter);
      return [];
  }

  // Filter the data based on the determined start and end weeks for all employees
  return weeklyReportData.filter(
    (report) => report.WeekNum >= startWeek && report.WeekNum <= endWeek
  );
};
const filterDataByMonthForAllEmployees = (month) => {
  console.log('Filtering by month for all employees...');
  const isSpecialMonth = ['Jan','May','July','Oct'].includes(month);
  let startWeek;
  let endWeek;

  if (isSpecialMonth) {
    // Define start and end weeks for special months
    switch (month) {
      case 'Jan': // January
        startWeek = 1;
        endWeek = 5;
        break;
      case 'May': // May
        startWeek = 18;
        endWeek = 22;
        break;
      case 'July': // July
        startWeek = 27;
        endWeek = 31;
        break;
      case 'Oct': // October
        startWeek = 40;
        endWeek = 44;
        break;
      default:
        // Handle unexpected month
        console.log('Unexpected month:', month);
        break;
    }
  } else {
    // Define start and end weeks for normal months
    switch (month) {
      case 'Feb': // February
        startWeek = 6;
        endWeek = 9;
        break;
      case 'Mar': // March
        startWeek = 10;
        endWeek = 13;
        break;
      case 'Apr': // April
        startWeek = 14;
        endWeek = 17;
        break;
      case 'Jun': // June
        startWeek = 23;
        endWeek = 26;
        break;
      case 'Aug': // August
        startWeek = 32;
        endWeek = 35;
        break;
      case 'Sep': // September
        startWeek = 36;
        endWeek = 39;
        break;
      case 'Nov': // November
        startWeek = 45;
        endWeek = 48;
        break;
      case 'Dec': // December
        startWeek = 49;
        endWeek = 52;
        break;
      default:
        // Handle unexpected month
        console.log('Unexpected month:', month);
        break;
    }
  }

  // Filter the data based on the determined start and end weeks for all employees
  return weeklyReportData.filter(
    (report) => report.WeekNum >= startWeek && report.WeekNum <= endWeek
  );
};

// Define function to filter data based on month and empId
const filterDataByMonthAndEmpId = (month, empId) => {
  console.log('Filtering by month and empId...');
  const isSpecialMonth = ['Jan','May','July','Oct'].includes(month);
  let startWeek;
  let endWeek;

  if (isSpecialMonth) {
    // Define start and end weeks for special months
    switch (month) {
      case 'Jan': // January
        startWeek = 1;
        endWeek = 5;
        break;
      case 'May': // May
        startWeek = 18;
        endWeek = 22;
        break;
      case 'Jul': // July
        startWeek = 27;
        endWeek = 31;
        break;
      case 'Oct': // October
        startWeek = 40;
        endWeek = 44;
        break;
      default:
        // Handle unexpected month
        break;
    }
  } else {
    // Define start and end weeks for normal months
    switch (month) {
      case 'Feb': // February
        startWeek = 6;
        endWeek = 9;
        break;
      case 'Mar': // March
        startWeek = 10;
        endWeek = 13;
        break;
      case 'Apr': // April
        startWeek = 14;
        endWeek = 17;
        break;
      case 'Jun': // June
        startWeek = 23;
        endWeek = 26;
        break;
      case 'Aug': // August
        startWeek = 32;
        endWeek = 35;
        break;
      case 'Sep': // September
        startWeek = 36;
        endWeek = 39;
        break;
      case 'Nov': // November
        startWeek = 45;
        endWeek = 48;
        break;
      case 'Dec': // December
        startWeek = 49;
        endWeek = 52;
        break;
      default:
        // Handle unexpected month
        break;
    }
  }

  // Filter the data based on the determined start and end weeks
  return weeklyReportData.filter(
    (report) => report.EmpNum === empId && report.WeekNum >= startWeek && report.WeekNum <= endWeek
  );
};

// Update the getWeeklyReport resolver in the GraphQL schema
const schema = makeExecutableSchema({
  typeDefs: `
    type Task {
      Technology: String
      taskName: String
      startDate: String
      endDate: String
      daysSpent: Float
    }

    type WeeklyReport {
      EmpNum: Int
      WeekNum: Int
      tasks: [Task]
    }

    type DropdownData {
      weeks: [Int]
      months: [String]
      quarters: [String]
    }

    type TechnologyStats {
      Technology: String
      totalDaysSpent: Float
    }

    type Query {
      getWeeklyReport(weekNum: Int, month: String, quarter: String, empId: Int): [WeeklyReport]
      getDropdownData: DropdownData
      getTechnologyStats(weekNum: Int): [TechnologyStats]
    }
  `,
  resolvers: {
    Query: {
      getWeeklyReport: (_, { weekNum, month, quarter, empId }) => {
        console.log('Query Parameters:', { weekNum, month, quarter, empId });
      
        let filteredData = weeklyReportData;
      
        if (empId !== undefined) {
          if (weekNum !== undefined) {
            // Filter based on empId and weekNum
            filteredData = weeklyReportData.filter(
              (report) => report.EmpNum === empId && report.WeekNum === weekNum
            );
          } else if (month !== undefined) {
            if (empId !== undefined && empId !== null){
            // Use the function to filter data based on month and empId
            filteredData = filterDataByMonthAndEmpId(month, empId);
          }
          else {
            // Use the function to filter data based on month for all employees
            console.log('Filtering by month for all employees...');
            filteredData = filterDataByMonthForAllEmployees(month);
          }} else if (quarter !== undefined) {
            if (empId !== undefined && empId !== null) {
            // Filter based on empId and quarter
            console.log('Filtering by quarter...');
            let quarterStartWeek, quarterEndWeek;
      
            switch (quarter.toUpperCase()) {
              case 'Q1':
                quarterStartWeek = 1;
                quarterEndWeek = 13;
                break;
              case 'Q2':
                quarterStartWeek = 14;
                quarterEndWeek = 26;
                break;
              case 'Q3':
                quarterStartWeek = 27;
                quarterEndWeek = 39;
                break;
              case 'Q4':
                quarterStartWeek = 40;
                quarterEndWeek = 52;
                break;
              default:
                // Handle unexpected quarter
                console.log('Unexpected quarter:', quarter);
                break;
            }
      
            filteredData = weeklyReportData.filter(
              (report) => report.EmpNum === empId && report.WeekNum >= quarterStartWeek && report.WeekNum <= quarterEndWeek
            );
          } else {
            // If only empId is provided, filter based on empId
            console.log('Filtering by quarter for all employees...');
            filteredData = filterDataByQuarterForAllEmployees(quarter);
          }}
        } else if (weekNum !== undefined) {
          // Filter based on weekNum
          filteredData = weeklyReportData.filter(
            (report) => report.WeekNum === weekNum
          );
        } else if (month !== undefined) {
         
          // Use the function to filter data based on month for all employees
          console.log('Filtering by month for all employees...');
          filteredData = filterDataByMonthForAllEmployees(month);
        } else if (quarter !== undefined) {
          // Filter based on quarter
          console.log('Filtering by quarter...');
          let quarterStartWeek, quarterEndWeek;
      
          switch (quarter.toUpperCase()) {
            case 'Q1':
              quarterStartWeek = 1;
              quarterEndWeek = 13;
              break;
            case 'Q2':
              quarterStartWeek = 14;
              quarterEndWeek = 26;
              break;
            case 'Q3':
              quarterStartWeek = 27;
              quarterEndWeek = 39;
              break;
            case 'Q4':
              quarterStartWeek = 40;
              quarterEndWeek = 52;
              break;
            default:
              // Handle unexpected quarter
              console.log('Unexpected quarter:', quarter);
              break;
          }
      
          filteredData = weeklyReportData.filter(
            (report) => report.WeekNum >= quarterStartWeek && report.WeekNum <= quarterEndWeek
          );
        } else {
          // If neither empId, weekNum, nor month is provided, return all data
          filteredData = weeklyReportData;
        }
      
        // Extract tasks data from the filtered results
        const tasksData = filteredData.map((report) => ({
          EmpNum: report.EmpNum,
          WeekNum: report.WeekNum,
          tasks: report.tasks,
        }));
      
        console.log('Filtered Data:', tasksData);
      
        return tasksData;
      },
            
      getDropdownData: () => {
        // Implement logic to fetch weeks, months, and quarters data
        // Return an object with arrays of weeks, months, and quarters
        return {
          weeks: Array.from({ length: 52 }, (_, i) => i + 1),
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
        };
      },
      getTechnologyStats: (_, { weekNum }) => {
        // Calculate total days spent on each technology for the specified weekNum
        const technologyStats = {};

        weeklyReportData.forEach((report) => {
          if (!weekNum || report.WeekNum === weekNum) {
            report.tasks.forEach((task) => {
              const { Technology, daysSpent } = task;
              if (technologyStats[Technology]) {
                technologyStats[Technology] += daysSpent;
              } else {
                technologyStats[Technology] = daysSpent;
              }
            });
          }
        });

        // Convert technologyStats object to an array of objects
        return Object.entries(technologyStats).map(([Technology, totalDaysSpent]) => ({
          Technology,
          totalDaysSpent,
        }));
      },
    },
  },
});

const app = express();
app.use(express.static('.'));
app.use(cors()); // Enable CORS
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

// Define the path to the weekly report data JSON file
const weeklyReportDataPath = path.join(__dirname, 'data', 'weeklyReportData.json');

// Read the existing weekly report data
weeklyReportData = [];

try {
  const existingData = fs.readFileSync(weeklyReportDataPath, 'utf-8');
  weeklyReportData = JSON.parse(existingData);
} catch (error) {
  console.error('Error reading existing weekly report data:', error.message);
}

const upload = multer({ dest: 'uploads/' });


app.post('/uploadAndMergeWeeklyReportData', upload.single('file'), (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      throw new Error('No file uploaded.');
    }

    // Check if the uploaded file is a JSON file
    if (file.mimetype !== 'application/json') {
      throw new Error('Invalid file type. Please upload a JSON file.');
    }

    // Read the uploaded file directly from the path
    const filePath = file.path;
    const newData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Check if the parsed data is an array
    if (!Array.isArray(newData)) {
      throw new Error('Uploaded data is not in the expected format.');
    }

    // Merge the new data with the existing data
    const mergedData = [...weeklyReportData, ...newData];

    // Write the merged data back to the file
    fs.writeFileSync(weeklyReportDataPath, JSON.stringify(mergedData, null, 2));

    // Delete the temporary file created by multer
    fs.unlinkSync(filePath);

    res.status(200).json({ success: true, message: 'Weekly report data updated successfully' });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



// Fetch merged weekly report data
app.get('/getMergedWeeklyReportData', (req, res) => {
  try {
      const existingData = JSON.parse(fs.readFileSync(weeklyReportDataPath, 'utf-8'));
      res.json(existingData);
  } catch (error) {
      console.error('Error reading existing weekly report data:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to merge uploaded data with existing data
app.post('/mergeWeeklyReportData', (req, res) => {
  try {
      const mergedData = req.body;

      // Write the merged data back to weeklyReportData.json
      fs.writeFileSync(weeklyReportDataPath, JSON.stringify(mergedData, null, 2));

      res.status(200).json({ success: true, message: 'Weekly report data merged successfully' });
  } catch (error) {
      console.error('Error merging data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`GraphQL server running at http://localhost:${PORT}/graphql`);
});