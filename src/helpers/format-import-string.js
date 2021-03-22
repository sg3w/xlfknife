const log = require('./log');


function formatImportStringToTranslationObj(content,type){

    switch (type){
        case 'csv':
            return formatImportCsvStringToTranslationObj(content);
            break;
        case 'xlf':
            return formatXlfStringToTranslationObj(content);
            break;
        case 'po':
            return formatPoStringToTranslationObj(content);
            break;
        default:
            //throw ;
            throw new Error("Wrong input format of the source file. Input-Format: "+type); //inside callback
            break;
    }

}
function formatPoStringToTranslationObj(poString) {
    var PO = require('pofile');

    var poObject = PO.parse(poString);
    var tanslate =[];
    poObject.items.forEach(itm => {
        tanslate.push({id: itm.msgid, target: itm.msgstr.join('')});
    })
    log(tanslate)
    log(poObject)
    return tanslate;
}

function formatXlfStringToTranslationObj(xmlString){
    const exportXlf = require('../exportXlf');
    //log(xmlString);
    return exportXlf(xmlString);
}

/**
 * CSV file format
 *
 * @param {string} translateObj
 * @returns
 */
function formatImportCsvStringToTranslationObj(csvString) {
    const CSV = require('csv-string');
    var tanslate =[];
    CSV.forEach(csvString, ';', function (row, index) {
        tanslate.push({id: row[0], source: row[1], target: row[2]});
    });
    return tanslate;
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

module.exports = { formatImportStringToTranslationObj, formatImportCsvStringToTranslationObj };