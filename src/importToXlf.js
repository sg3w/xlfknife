const convert = require('xml-js');
const log = require('./helpers/log');
const date = require('./helpers/date');
const XmlWalker = require('./class/XmlWalker.js');
const xmlWalker = new XmlWalker();
/**
 * Translates an .xlf file from one language to another
 *
 * @param {string} input The source of the .xlf file, as a string
 * @param {object} trnslObj The language code of the input file
 *
 * @returns {string}
 */

async function importTrnslObjToXlf(input, trnslObj,options) {
    xmlWalker.xml2js(input);
    const idsInXlf = xmlWalker.walk(function(elem){
        if (elem.name === 'file') {
            elem.attributes['target-language'] = options.lang;
            elem.attributes['date'] = date();
            if(options.sourceLanguage){
                elem.attributes['source-language'] = options.sourceLanguage;
            }
        }
        if (elem.name === 'trans-unit') {
            return elem.attributes['id'];
        }
        return false;
    });
   // log(trnslObj);
    xmlWalker.walk(function(elem){
        if (elem.name === 'body') {
            trnslObj.forEach(tObj => {
                if (tObj.id && !idsInXlf.includes(tObj.id)) {
                    elem.elements.push(createJsDomElement(tObj));
                }
            });
        }
        return true;
    });


    if(options.merge != undefined ){
        xmlWalker.walk(function(elem){
            if ( elem.name === 'trans-unit') {
                var newSource = false
                trnslObj.forEach(tObj => {
                    if (tObj.id == elem.attributes['id']) {
                        const sourceObj = (options.merge=='target2source')?tObj.target:tObj.source;
                        newSource = convert.xml2js('<source>' +sourceObj + '</source>').elements[0];
                    }
                });
                if(elem.elements.find(el => el.name === 'source') == undefined){
                    if(newSource)
                        elem.elements.unshift(newSource);
                }else{
                    elem.elements.forEach(function(el, index) {
                        if(elem.elements[index].name === 'source'){
                            elem.elements[index] = newSource;
                        }
                    });
                }
            }
        });
    }


    return xmlWalker.js2xml( {
        spaces: 4,
        // https://github.com/nashwaan/xml-js/issues/26#issuecomment-355620249
        attributeValueFn: function (value) {
            return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    });
}


async function reportkeysTrnslObjects(input, trnslObj,mode) {
    xmlWalker.xml2js(input);

    const idsInXlf = xmlWalker.walk(function(elem){
        if (elem.name === 'trans-unit') {
            return elem.attributes['id'];
        }
        return false;
    });


    if(mode=='file'){
        return idsInXlf;
    }
    const returnIDs =[];
    for(var i = 0; i < trnslObj.length; i++) {
        if(mode=='missing') {
            if (trnslObj[i].id && !idsInXlf.includes(trnslObj[i].id)) {
                returnIDs.push(trnslObj[i].id);
            }
        }
        else if(mode=='source'||mode=='all'){
            returnIDs.push(trnslObj[i].id);
        }
    }
    if(mode=='all'){
        //returnIDs.concat(returnIDs).unique();
        return [...new Set([...returnIDs ,...idsInXlf])];
    }

    return returnIDs;
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


function getEmptyXlfFile(){
    var filecontent =  '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n' +
        '<xliff version="1.0">\n' +
        '    <file source-language="" datatype="plaintext">\n' +
        '        <body>\n' +
        '        </body>\n' +
        '    </file>\n' +
        '</xliff>';
    return filecontent;
}

module.exports = { importTrnslObjToXlf , reportkeysTrnslObjects,getEmptyXlfFile };