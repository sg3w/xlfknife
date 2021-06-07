const convert = require('xml-js');
const log = require('./helpers/log');
const XmlWalker = require('./class/XmlWalker.js');
/**
 * Convert *.xlf File to an internal data object
 *
 * @param {string} input The source of the .xlf file as string
 *
 * @returns {string}
 */
async function convertXlf2Object(input) {
    const xmlWalker = new XmlWalker(input);
    const data = xmlWalker.walk(function(elem){
        if (elem.name === 'trans-unit') {
            const source = elem.elements.find(el => el.name === 'source');
            const target = elem.elements.find(el => el.name === 'target');
            return {
                id:elem.attributes['id'],
                source:source ? xmlElement2String(source) : '',
                target:target ? xmlElement2String(target) : ''
            };
        }
        return false;
    });
    return data;
}

function xmlElement2String(xmlNode){
    let sourceValue='';
    if(xmlNode.elements){
        xmlNode.elements.forEach(el => {
            const options = {compact: false, ignoreComment: false, spaces: 4};
            const elements = {elements:[el]}
            sourceValue += convert.json2xml(elements,options);
        });
    }
    return sourceValue;
}

module.exports = {convertXlf2Object};