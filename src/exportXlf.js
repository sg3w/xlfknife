const convert = require('xml-js');
const log = require('./helpers/log');

/**
 * Convert *.xlf File to an internal data object
 *
 * @param {string} input The source of the .xlf file as string
 *
 * @returns {string}
 */
async function convertXlf2Object(input) {
    const xlfStruct = convert.xml2js(input);
    const elementsQueue = [];
    const targetsQueue = [];
    const exportData = [];
    elementsQueue.push(xlfStruct);
    while (elementsQueue.length) {
        const elem = elementsQueue.shift();
        if (elem.name === 'trans-unit') {
            const id = elem.attributes['id'];
            const source = elem.elements.find(el => el.name === 'source');
            const target = elem.elements.find(el => el.name === 'target');
            var targetValue = target ? xmlElement2String(target) : '';
            var sourceValue = source ? xmlElement2String(source) : '';
            exportData.push({id:id,source:sourceValue,target:targetValue});
            continue;
        }
        if (elem && elem.elements && elem.elements.length) {
            elementsQueue.push(...elem.elements)
        };
    }
    return exportData;
}

function xmlElement2String(xmlNode){
    var sourceValue='';
    if(xmlNode.elements){
        xmlNode.elements.forEach(el => {
            var options = {compact: false, ignoreComment: false, spaces: 4};
            var elements = {elements:[el]}
            sourceValue += convert.json2xml(elements,options);
        });
    }
    return sourceValue;
}

module.exports = {convertXlf2Object};