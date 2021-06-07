const convert = require('xml-js');
const log = require('../helpers/log');
class XmlWalker {
    /**
     * @param {filecontent} fileconten as string
     */
    constructor(filecontent) {
        if(filecontent) {
            this.xlfStruct = convert.xml2js(filecontent,{alwaysChildren: true});
        }
        this.elementsQueue = [];
    }
    /**
     * walks through xml element and calls back
     *
     * @param {function} callback function
     * @returns {array} of callback functions results
     */
    walk(callback){
        this.elementsQueue.length = 0;
        this.elementsQueue.push(this.xlfStruct);
        const result = [];
        while (this.elementsQueue.length) {
            const elem = this.elementsQueue.shift();
            const func_result = callback(elem);
            if(func_result){
                result.push(func_result);
            }
            if (elem && elem.elements && elem.elements.length) {
                this.elementsQueue.push(...elem.elements)
            }
        }
        return result;
    }

    /**
     * convert xml2js
     *
     * @param {string} xml filecontent
     * @param {object} options
     */
    xml2js(filecontent,options){
        this.xlfStruct = convert.xml2js(filecontent,options);
        this.elementsQueue = [];
    }

    /**
     * convert js2xml
     *
     * @param {object} options
     * @returns {string} xml string
     */
    js2xml(options){
        return convert.js2xml(this.xlfStruct, options);
    }
}
module.exports = XmlWalker;