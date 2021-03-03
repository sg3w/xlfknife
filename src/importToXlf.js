//const googleTranslate = require('@k3rn31p4nic/google-translate-api');
//const chalk = require('chalk');
//const cloneDeep = require('lodash.clonedeep');
const convert = require('xml-js');
//const Bottleneck = require('bottleneck/es5');

//const jsdom = require("jsdom");
//const { JSDOM } = jsdom;

const log = require('./helpers/log');
//const match = require('./helpers/text-matcher');
//const date = require('./helpers/date');

/**
 * Translates an .xlf file from one language to another
 *
 * @param {string} input The source of the .xlf file, as a string
 * @param {object} trnslObj The language code of the input file
 *
 * @returns {string}
 */




async function importTrnslObjToXlf(input, trnslObj) {
    const xlfStruct = convert.xml2js(input,{alwaysChildren:true});


    const elementsQueue = [];
    const targetsQueue = [];
    const exportData = [];

    const idsInXlf = [];

    elementsQueue.push(xlfStruct);

    while (elementsQueue.length) {
        const elem = elementsQueue.shift();
        //log(elem);
        /*
        if (elem.name === 'file') {
            elem.attributes['target-language'] = to;
            elem.attributes['date'] = date();
        }
*/
        if (elem.name === 'trans-unit') {

            const id = elem.attributes['id'];
            idsInXlf.push(id);
            continue;
        }


        if (elem && elem.elements && elem.elements.length) {
            elementsQueue.push(...elem.elements)
        };


    }
    elementsQueue.length = 0
    elementsQueue.push(xlfStruct);

    while (elementsQueue.length) {
        const elem = elementsQueue.shift();

        if (elem.name === 'body') {
            //log(elem);


            /*
            //trnslObj.forEach()
            var tOs = '<trans-unit id="gender.1333"><source><![CDATA[Miss333]]></source><target><h1>Frau333</h1></target></trans-unit>';
            log(convert.xml2js(tOs));
            var o = convert.xml2js(tOs);
            elem.elements.push(o.elements[0]);
*/

            trnslObj.forEach(tObj => {
                if( tObj.id && ! idsInXlf.includes(tObj.id)){
                    elem.elements.push(createJsDomElement(tObj));
                }

            });





        }





        if (elem && elem.elements && elem.elements.length) {
            elementsQueue.push(...elem.elements)
        };


    }


    //log(idsInXlf);
    //return exportData;

    return convert.js2xml(xlfStruct, {
        spaces: 4,
        // https://github.com/nashwaan/xml-js/issues/26#issuecomment-355620249
        attributeValueFn: function (value) {
            return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    });

}

function createJsDomElement(tObj){
    const tOs = '<trans-unit id="'+tObj.id+'"><source>'+tObj.source+'</source><target>'+tObj.target+'</target></trans-unit>';
    //log(convert.xml2js(tOs));
    const o = convert.xml2js(tOs);
    return o.elements[0];
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




module.exports = importTrnslObjToXlf;