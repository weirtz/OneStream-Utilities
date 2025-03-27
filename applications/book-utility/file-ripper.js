// Brendan Weirtz | 3/28/23
const fs = require('fs');
const cheerio = require('cheerio');
const XLSX = require('xlsx');

const oldConsoleLog = console.log;
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

function ripFiles(callback){
    console.log = (msg) => {
        oldConsoleLog.apply(console, arguments);
        eventEmitter.emit('log', msg);
      };
    const inputFilePath = 'applications/book-utility/files/input';
    const outputFile = 'applications/book-utility/files/output/cubeview-names.xlsx';
    
    //Create a new workbook
    const workbook = XLSX.utils.book_new();
    var fileCount = 0;
    var reportCount = 0;
    
    //Create worksheets
    //REPORT NAMES
    const worksheetReports = XLSX.utils.aoa_to_sheet([['CubeView Name:','File Name:','File Type:']]);
    //BOOK FILE NAMES
    const worksheetFileNames = XLSX.utils.aoa_to_sheet([['Extract Information:']]);
    
    //Create a set to store the unique report names and book file names, removing any duplicate report and book file names.
    const uniqueReportNames = new Set();
    const fileNames = new Set();
    const cvANDfiles = new Array();
    

    //Loop through each input file and process it
    fs.readdirSync(inputFilePath).forEach((inputFile) => {
        let fileExt = new String;
        //Check if the file has a .pdfBook extension
        if(inputFile.endsWith('.pdfBook') || inputFile.endsWith('.xlBook')) {

            if(inputFile.endsWith('.pdfBook')){
                fileExt = "pdfBook"
            }else if(inputFile.endsWith('.xlBook')){
                fileExt = "xlBook"
            }

            console.log(`&emsp;`);
            //Load the pdfBook File
            const pdfBookFile = fs.readFileSync(`${inputFilePath}/${inputFile}`);
    
            console.log(`Processing: ${inputFilePath}/${inputFile}`);
            fileCount++;
    
            //Load the file contents into a cheerio object
            const $ = cheerio.load(pdfBookFile, { xmlMode: true });
    
            //Search for BookItem elements with BookItemType="Report"
            const reportElements = $('ReportArgs[ReportType="CubeView"]');
            const reportElementsTwo = $('ExcelExportItemArgs[ExcelExportItemType="CubeView"]');

            if (reportElements.length === 0) {
                console.log(`&emsp; <span class="log-light-red">No CubeViews found in file(s)!</span>`);
            }
    
            let reportNames = null;

            //Extract the Name attribute from each report element
            if(inputFile.endsWith('.pdfBook')){
                reportNames = reportElements.map((_, el) => {
                    const reportArgsEl = $(el);
                    return reportArgsEl.attr('ItemName');
                }).get();
            }else if(inputFile.endsWith('.xlBook')){
                reportNames = reportElementsTwo.map((_, el) => {
                    const reportArgsEl = $(el);
                    return reportArgsEl.attr('ItemName');
                }).get();
            }
    
            reportCount += reportNames.length;
    
            //Add each unique report/book name to the set
            reportNames.filter((name) => name !== undefined).forEach((name) => {
                if(uniqueReportNames.has(name)) {
                    console.log(`&emsp; <span class="log-yellow">[Duplicate CubeView] CubeView Name:</span> ${name}`);
                }else{
                    console.log(`&emsp; <span class="log-blue">[Unique CubeView] CubeView Name:</span> ${name}`);
                    uniqueReportNames.add(name);
                    
                }
                cvANDfiles.push([name, inputFile, fileExt]);
            });
            
            fileNames.add(inputFile);
            
        }
    });
    
    //filter unique arrays of array
    let stringArray = cvANDfiles.map(JSON.stringify);
    let uniqueStringArray = new Set(stringArray);
    let uniqueArray = Array.from(uniqueStringArray, JSON.parse);

    try{
        //Add the unique report names to the worksheet
        const namesAsArray = Array.from(uniqueReportNames).map((name) => [name]);
        XLSX.utils.sheet_add_aoa(worksheetReports, uniqueArray, {origin:1});
    
        //Add the file names to the worksheet
        // const fileNamesAsArray = Array.from(fileNames).map((name) => [name]);
        // XLSX.utils.sheet_add_aoa(worksheetFileNames, fileNamesAsArray, {origin:2});
    
      try {
          // Add the current date to cell D1 of the report data worksheet
          const currentDate = new Date().toISOString().substring(0, 10);
        //   XLSX.utils.sheet_add_aoa(worksheetFileNames, [["OneStream Book Report Utility v1.0.0"]], {origin: 'A3'});
          XLSX.utils.sheet_add_aoa(worksheetFileNames, [["Report generated on: " +currentDate]], {origin: 'A4'});
          XLSX.utils.sheet_add_aoa(worksheetFileNames, [["Total files scanned: " +fileCount]], {origin: 'A5'});
          XLSX.utils.sheet_add_aoa(worksheetFileNames, [["Total CubeView references found: " +reportCount]], {origin: 'A6'});
        } catch (err) {
            console.log(`Error adding date to worksheet`);
            console.log(err);
        }
    
        //Add the worksheets to the workbook.
        XLSX.utils.book_append_sheet(workbook,worksheetReports,'CubeViews');
        XLSX.utils.book_append_sheet(workbook,worksheetFileNames,'Extract Info');
    
        //Write the workbook to the output file
        XLSX.writeFile(workbook, outputFile);
    
        console.log(`&emsp;`);
        console.log(`--- <span class="log-green">Job Completed</span> ---------------------------------------------------`);
        console.log(`Processed <span class="log-blue">${fileCount}</span> files.`);
        console.log(`Found <span class="log-blue">${reportCount}</span> CubeView names.`);
        console.log(`Found <span class="log-blue">${uniqueReportNames.size}</span> unique CubeView names.`);
        console.log(`&emsp;`);
        console.log(`<span class="log-green">CubeView names written to "${outputFile}"</span>`);
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