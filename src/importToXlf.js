const convert = require('xml-js');
const log = require('./helpers/log');
const date = require('./helpers/date');

/**
 * Translates an .xlf file from one language to another
 *
 * @param {string} input The source of the .xlf file, as a string
 * @param {object} trnslObj The language code of the input file
 *
 * @returns {string}
 */

async function importTrnslObjToXlf(input, trnslObj,options) {
    const xlfStruct = convert.xml2js(input, {alwaysChildren: true});
    const elementsQueue = [];
    const idsInXlf = [];
    elementsQueue.push(xlfStruct);

    while (elementsQueue.length) {
        const elem = elementsQueue.shift();
        //log(elem);

        if (elem.name === 'file') {
            elem.attributes['target-language'] = options.lang;
            elem.attributes['date'] = date();
        }

        if (elem.name === 'trans-unit') {
            const id = elem.attributes['id'];
            idsInXlf.push(id);
            continue;
        }
        if (elem && elem.elements && elem.elements.length) {
            elementsQueue.push(...elem.elements);
        }
    }

    elementsQueue.length = 0
    elementsQueue.push(xlfStruct);

    while (elementsQueue.length) {
        const elem = elementsQueue.shift();
        if (elem.name === 'body') {
            trnslObj.forEach(tObj => {
                if (tObj.id && !idsInXlf.includes(tObj.id)) {
                    elem.elements.push(createJsDomElement(tObj));
                }
            });
        }
        if (elem && elem.elements && elem.elements.length) {
            elementsQueue.push(...elem.elements);
        }
    }
    return convert.js2xml(xlfStruct, {
        spaces: 4,
        // https://github.com/nashwaan/xml-js/issues/26#issuecomment-355620249
        attributeValueFn: function (value) {
            return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    });

}


async function reportkeysTrnslObjects(input, trnslObj) {
    const xlfStruct = convert.xml2js(input, {alwaysChildren: true});
    const elementsQueue = [];
    const idsInXlf = [];
    elementsQueue.push(xlfStruct);

    while (elementsQueue.length) {
        const elem = elementsQueue.shift();
        if (elem.name === 'trans-unit') {
            const id = elem.attributes['id'];
            idsInXlf.push(id);
            continue;
        }
        if (elem && elem.elements && elem.elements.length) {
            elementsQueue.push(...elem.elements);
        }
    }
    elementsQueue.length = 0
    elementsQueue.push(xlfStruct);
    const missingIDs = [];
    while (elementsQueue.length) {
        const elem = elementsQueue.shift();
        if (elem.name === 'body') {
            trnslObj.forEach(tObj => {
                if (tObj.id && !idsInXlf.includes(tObj.id)) {
                    missingIDs.push(tObj.id);
                }
            });
        }
        if (elem && elem.elements && elem.elements.length) {
            elementsQueue.push(...elem.elements);
        }
    }
    return missingIDs;
}




function createJsDomElement(tObj) {
    var tOs = '<trans-unit id="' + tObj.id + '">';
    if(tObj.source ) tOs +='<source>' + tObj.source + '</source>';
    if(tObj.target ) {
        tOs +='<target>' + tObj.target + '</target>';
    }else{
        tOs +='<target state="needs-translation"></target>';

    }
    tOs +='</trans-unit>';
    const o = convert.xml2js(tOs);
    return o.elements[0];
}

//module.exports = importTrnslObjToXlf;

module.exports = { importTrnslObjToXlf , reportkeysTrnslObjects };