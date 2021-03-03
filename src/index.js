#! /usr/bin/env node

/*
    For usage help, run "node index.js help"
*/
const path = require('path');
const chalk = require('chalk');
const { readFileAsync, writeFileAsync } = require('./helpers/fs-async');


const importTrnslObjToXlf = require('./importToXlf');

const exportXlf = require('./exportXlf');
const log = require('./helpers/log');
const fs = require('fs');

// setup up the command line interface
const argv = require('yargs')
    .usage(
        'xlfknife [command] [options] \nCreate, update, import and export xlf files.'
    )
    .example(
        //'command',
        'create       Create an new Language file from an other xlf,po or csv file',
        '  update'
    )
    .example(
        'xlf2xlf -i messages.xlf -o messages.fr.xlf -f en -t fr',
        'Translate an .xlf file from English to French'
    )
    //.command('create <file> [options]', 'Create xlf from another file')
    //.command('update <file> [options]', 'Create xlf from another file')
    .command('export <file> [options]', 'Exports XLF files to *.csv or *.po',(yargs) => {
        yargs
            .option('format', {
                demand: false,
                default:'csv',
                describe: 'Default: csv. (csv|po|php|js)',
                type: 'string',
            })
            .option('o', {
                alias: 'out',
                demand: false,
                describe: 'The name of the output file',
                type: 'string',
            })
    })
    .command('import <file> [options]', 'Exports XLF files to *.csv or *.po',(yargs) => {
        yargs
            .option('source', {
                demand: true,
                type: 'string',
                description: 'Source file for import in xlf. (csv|po)',
            })
            .option('target', {
                demand: true,
                type: 'string',
                description: 'Target file for write xlf.)',
            })
            .option('format', {
                demand: false,
                default:'csv',
                describe: 'Default: csv. (csv|po|xml|json)',
                type: 'string',
            })
            .option('stdOut', {
                demand: false,
                type: 'boolean',
                description: 'Stream content to stdOut',
            });
    })
    /*
    .option('i', {
        alias: 'in',
        demand: false,
        describe: 'The input .xlf file to translate',
        type: 'string',
    })*/


    /*
    .option('f', {
        alias: 'from',
        demand: false,
        describe: 'The language code of the input file',
        type: 'string',
    })
    .option('t', {
        alias: 'to',
        demand: false,
        describe: 'The language code to translate to',
        type: 'string',
    })
    .option('r', {
        alias: 'rate',
        demand: false,
        describe:
            'Sets the rate limit for requests. For more information see https://github.com/SGrondin/bottleneck#readme',
        type: 'number',
        default: 0,
    })
    .option('s', {
        alias: 'skip',
        demand: false,
        describe:
            'Skips translating and adds only target tag with boilerplate text',
        type: 'boolean',
        default: false,
    })*/
    .help('h')
    .alias('h', 'help')
    .argv;

// start a timer so that we can
// report how long the whole process took
const startTime = Date.now();

console.log(argv);
/*console.log(argv._)
*/

if(argv._.includes('create')){
    console.log('create');
}else if(argv._.includes('import')){
    const{ formatImportCsvStringToTranslationObj }= require('./helpers/format-import-string');
    readFileAsync(path.resolve(argv.source))
        .then(filecontent => {

            return formatImportCsvStringToTranslationObj(filecontent.toString())
        })
        .then(translationObj => {

            if(argv.file === 'create' || argv.file === 'new'){
                var filecontent =  '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n' +
                    '<xliff version="1.0">\n' +
                    '    <file source-language="" datatype="plaintext">\n' +
                    '        <body>\n' +
                    '        </body>\n' +
                    '    </file>\n' +
                    '</xliff>';

            }else{
                var filecontent = fs.readFileSync(path.resolve(argv.file),'utf8');

            }
            log(filecontent);
            return importTrnslObjToXlf(filecontent,translationObj)


        })
        .then(output => {
            if(argv.stdOut){
                process.stdout.write(output);
            }else{
                return writeFileAsync(path.resolve(argv.target), output);
            }
        })
        .catch(err => {
            log(
                chalk.red('X') +
                ' Something went wrong while importing ' +
                argv.source + ' into ' + argv.file +
                '!'
            );
            log( '' + err);
        });

}else if(argv._.includes('export')){
    readFileAsync(path.resolve(argv.file))
        .then(xlf => {
            return exportXlf(xlf.toString(),'csv');
        })
        .then(exportData => {
            const { formatExportCsv, formatExportPo,formatExportPhp,formatExportJs } = require('./helpers/format-export-string');
            switch(argv.format){
                case 'po':
                    return formatExportPo(exportData);
                break;
                case 'php':
                    return formatExportPhp(exportData);
                break;
                case 'js':
                case 'json':
                    return formatExportJs(exportData);
                    break;
                default:
                    return formatExportCsv(exportData);
                break;
            }
        })
        .then(output => {
            if(argv.out){
                return writeFileAsync(path.resolve(argv.out), output);
            }else{
                process.stdout.write(output);
            }
            //return writeFileAsync(path.resolve(argv.out), output);

        })

        // or, if something went wrong,  a grumpy one
        .catch(err => {
            log(
                chalk.red('X') +
                ' Something went wrong while translating ' +
                argv.in +
                '!'
            );
            log('' + err.stack);
        });

}
