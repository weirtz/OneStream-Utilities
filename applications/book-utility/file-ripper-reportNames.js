// Brendan Weirtz | 3/28/23
const fs = require('fs');
const cheerio = require('cheerio');
const XLSX = require('xlsx');

const http = require('http');
const serverUrl = 'http://localhost:4000/log'; // Replace with your server URL
const oldConsoleLog = console.log;

const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

function ripFiles(callback){

    console.log = (msg) => {
        oldConsoleLog.apply(console, arguments);
        eventEmitter.emit('log', msg);
      };

    const inputFilePath = 'applications/book-utility/files/input';
    const outputFile = 'applications/book-utility/files/output/report-names.xlsx';
    
    //Create a new workbook
    const workbook = XLSX.utils.book_new();
    var fileCount = 0;
    var reportCount = 0;
    
    //Create worksheets
    //REPORT NAMES
    const worksheetReports = XLSX.utils.aoa_to_sheet([['Book Report Names:']]);
    //BOOK FILE NAMES
    const worksheetFileNames = XLSX.utils.aoa_to_sheet([['Books that reports were requested to extract from:']]);
    
    //Create a set to store the unique report names and book file names, removing any duplicate report and book file names.
    const uniqueReportNames = new Set();
    const fileNames = new Set();
    
    //Loop through each input file and process it
    fs.readdirSync(inputFilePath).forEach((inputFile) => {
        
        //Check if the file has a .pdfBook extension
        if(inputFile.endsWith('.pdfBook')) {
            console.log(`&emsp;`);
            //Load the pdfBook File
            const pdfBookFile = fs.readFileSync(`${inputFilePath}/${inputFile}`);
    
            console.log(`Processing: ${inputFilePath}/${inputFile}`);
            fileCount++;
    
            //Load the file contents into a cheerio object
            const $ = cheerio.load(pdfBookFile, { xmlMode: true });
    
            //Search for BookItem elements with BookItemType="Report"
            const reportElements = $('BookItem[BookItemType="Report"]');
    
            if (reportElements.length === 0) {
                console.log(`&emsp; <span class="log-light-red">No reports found in file!</span>`);
            }
    
            //Extract the Name attribute from each report element
            const reportNames = reportElements.map((_, el) => {
                const reportArgsEl = $(el).find('ReportArgs');
                if (reportArgsEl.length > 0) {
                    return reportArgsEl.attr('ItemName');
                }
            }).get();
    
            reportCount += reportNames.length;
    
            //Add each unique report/book name to the set
            reportNames.filter((name) => name !== undefined).forEach((name) => {
                if(uniqueReportNames.has(name)) {
                    console.log(`&emsp; <span class="log-yellow">[Duplicate Report] Report Name:</span> ${name}`);
                }else{
                    console.log(`&emsp; <span class="log-blue">[Unique Report]    Report Name:</span> ${name}`);
                    uniqueReportNames.add(name);
                    
                }
            });
            
            fileNames.add(inputFile);
        }
    });
    
    try{
        //Add the unique report names to the worksheet
        const namesAsArray = Array.from(uniqueReportNames).map((name) => [name]);
        XLSX.utils.sheet_add_aoa(worksheetReports, namesAsArray, {origin:2});
    
        //Add the file names to the worksheet
        const fileNamesAsArray = Array.from(fileNames).map((name) => [name]);
        XLSX.utils.sheet_add_aoa(worksheetFileNames, fileNamesAsArray, {origin:2});
    
      try {
          // Add the current date to cell D1 of the report data worksheet
          const currentDate = new Date().toISOString().substring(0, 10);
          XLSX.utils.sheet_add_aoa(worksheetReports, [[null, null, null, "Generated on: " +currentDate]], {origin: 'D1'});
        } catch (err) {
            console.log(`Error adding date to worksheet`);
            console.log(err);
        }
    
        //Add the worksheets to the workbook.
        XLSX.utils.book_append_sheet(workbook,worksheetReports,'Reports');
        XLSX.utils.book_append_sheet(workbook,worksheetFileNames,'File Names');
    
        //Write the workbook to the output file
        XLSX.writeFile(workbook, outputFile);
    
        console.log(`&emsp;`);
        console.log(`--- <span class="log-green">Job Completed</span> ---------------------------------------------------`);
        console.log(`Processed <span class="log-blue">${fileCount}</span> files.`);
        console.log(`Found <span class="log-blue">${reportCount}</span> report names.`);
        console.log(`Found <span class="log-blue">${uniqueReportNames.size}</span> unique report names.`);
        console.log(`&emsp;`);
        console.log(`<span class="log-green">Report names written to "${outputFile}"</span>`);
        console.log(`---------------------------------------------------------------------`);
        console.log(`&emsp;`);

        const filesRipped = true;
        callback(filesRipped);
    
    } catch (err) {
        if(err.code === 'EBUSY'){
            console.log(`&emsp;`);
            console.log(`--- <span class="log-red">Job Failure</span> -----------------------------------------------------`);
            console.log(`<span class="log-light-red">The file ${outputFile} is open in another program. Please close the file and try again.</span>`);
            console.log(`---------------------------------------------------------------------`);
            console.log(`&emsp;`);
        }

        const filesRipped = false;
        callback(filesRipped, outputFile);

    }
    
    
}

module.exports = { ripFiles, eventEmitter };