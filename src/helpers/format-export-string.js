const log = require('./log');

/**
 * CSV file format
 *
 * @param {object} translateObj
 * @returns
 */
function formatExportCsv(translateObj) {
    const CSV = require('csv-string');
    //translateObj.forEach(row => {
    //log(CSV.stringify(translateObj));
    //return CSV.stringify(translateObj);

    //var lines = ;

    var lines = [];
    translateObj.forEach(row => {
        lines.push([row.id,row.source,row.target]);
    });
    return CSV.stringify(lines,';')
    /*
    translateObj.forEach(row => {
        content += '"' + [row.id,row.source,row.target].join('";"') + '"\n';
    });
    return content;
*/
    const arrayToCSV = (translateObj, delimiter = ',') => translateObj.map(v => v.map(x => `"${x}"`).join(delimiter)).join('\n');
    return arrayToCSV;
}

/**
 * PO file format
 *
 * @todo: multiline msgstr got every line in quotes
 * @param {object} translateObj
 * @returns
 */
function formatExportPo(translateObj) {
    var content = '';
    translateObj.forEach(row => {
        content += 'msgid: "'+ row.id + '"\n';
        content += 'msgstr: "' + (row.target?row.target:row.source) + '"\n\n';
    });
    return content;
}

/**
 * Format a php file with a return of an array
 *
 * @param {object} translateObj
 * @returns
 */
function formatExportPhp(translateObj) {
    var content = '<?php\nreturn [\n';
    translateObj.forEach(row => {
        content += '"'+ row.id + '" => "' + (row.target?row.target:row.source).replace(/"/g, '\\"') + '",\n';
    });
    return content +'];';
}

/**
 * Format a php file with a return of an array
 *
 * @param {object} translateObj
 * @returns
 */
function formatExportJs(translateObj) {
    return JSON.stringify(translateObj);
}

module.exports = { formatExportCsv , formatExportPo ,formatExportPhp,formatExportJs};