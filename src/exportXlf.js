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
 * @param {string} format The language code of the input file
 *
 * @returns {string}
 */

async function exportXlf22(input, format) {
    const dom = new JSDOM(input);

    console.log(dom.serialize());

    //var elements = dom.window.document.getElementsByName("source");

    //console.log(elements.toString());
    elements.forEach(el => {

        console.log(el);
    });
    //console.log(dom.window.document.querySelector("source").innerHTML);
}


async function exportXlf(input, format) {
    const xlfStruct = convert.xml2js(input);


    const elementsQueue = [];
    const targetsQueue = [];
    const exportData = [];

    elementsQueue.push(xlfStruct);
   // log(xlfStruct);
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
            //log(id);

            const source = elem.elements.find(el => el.name === 'source');
            const target = elem.elements.find(el => el.name === 'target');

            /*
            if (target) {
                var targetValue = '';

                targetValue = xmlElement2String(target);
            }*/
            var targetValue = target ? xmlElement2String(target) : '';
            var sourceValue = source ? xmlElement2String(source) : '';


            exportData.push({id:id,source:sourceValue,target:targetValue});

            continue;
        }


        if (elem && elem.elements && elem.elements.length) {
            elementsQueue.push(...elem.elements)
        };

         /**/
    }

    /*
    const allPromises = skip
        ? []
        : targetsQueue.map((el) => limiter.schedule(() => getTextTranslation(el, from, to, skip)));

    await Promise.all(allPromises);
*/
    return exportData;
    /*
    return convert.js2xml(xlfStruct, {
        spaces: 4,
        // https://github.com/nashwaan/xml-js/issues/26#issuecomment-355620249
        attributeValueFn: function (value) {
            return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    });

     */
}


function xmlElement2String(xmlNode){
    var sourceValue='';
    if(xmlNode.elements){
        xmlNode.elements.forEach(el => {

            var options = {compact: false, ignoreComment: false, spaces: 4};
            var elements = {elements:[el]}
            sourceValue += convert.json2xml(elements,options);

            //log(el)
            /*
            if (el.type === 'text') {

                sourceValue += el.text;

                //log(sourceValue)
            }else if(el.type === 'element' || el.type === 'cdata'){
                var options = {compact: false, ignoreComment: false, spaces: 4};
                var elements = {elements:[el]}
                sourceValue += convert.json2xml(elements,options);


            else{
                //log(el.type)
            }            }
        */
        });
    }
   // log(sourceValue)
    return sourceValue;
}


async function getTextTranslation(el, from, to) {
    try {
        const result = await googleTranslate(el.text, { from, to });
        log(
            'Translating ' +
            chalk.yellow(el.text) +
            ' to ' +
            chalk.green(result.text)
        );
        el.text = result.text;
    } catch (err) {
        console.log(`[ERROR] ${JSON.stringify(err)}`);
        console.log('[TRACE]', err.stack);
        el.text = '[WARN] Failed to translate';
    }
}

module.exports = exportXlf;