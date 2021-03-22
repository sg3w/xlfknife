#! /usr/bin/env node

/*
    For usage help, run "node index.js help"
*/
const path = require('path');
const chalk = require('chalk');
const { readFileAsync, writeFileAsync } = require('./helpers/fs-async');


const {importTrnslObjToXlf,reportkeysTrnslObjects} = require('./importToXlf');

const exportXlf = require('./exportXlf');
const log = require('./helpers/log');
const fs = require('fs');

const { fileExtname  }= require('./helpers/file');


const argv = require('yargs')
    .command('export <file> [options]', 'Exports XLF files to *.csv or *.po',(yargs) => {
        yargs
            .positional('file', {
                describe: 'port to bind on',
                default: 5000
            })
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
            .option('lang', {
                demand: true,
                type: 'string',
                description: 'ISO2 Language Code',
            })
            .option('target', {
                demand: false,
                type: 'string',
                description: 'Target file for write xlf.',
            })
            .option('format', {
                demand: false,
                default:'csv',
                describe: 'Default: csv. (csv|po|xml|json)',
                type: 'string',
            })
        ;

    })
    .command('reportkeys <file> [options]', 'Exports XLF files to *.csv or *.po',(yargs) => {
        yargs
            .option('source', {
                demand: true,
                type: 'string',
                description: 'Source file for import in xlf. (csv|po)',
            })

        ;

    })
    .demandCommand(1, 'You need at least one command before moving on')
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    })
    .help()
    .argv;

const startTime = Date.now();

//console.log(argv);
/*console.log(argv._)
*/






if(argv._.includes('create')){
    console.log('create');
}else if(argv._.includes('reportkeys')){
    const{ formatImportStringToTranslationObj }= require('./helpers/format-import-string');
    readFileAsync(path.resolve(argv.source))
        .then(filecontent => {
            //log(fileExtname(argv.source));
            return formatImportStringToTranslationObj(filecontent.toString(),fileExtname(argv.source))
        })
        .then(translationObj => {
            //log(translationObj);
            var filecontent = fs.readFileSync(path.resolve(argv.file),'utf8');
            return reportkeysTrnslObjects(filecontent,translationObj);
        })
        .then(output => {
            //log(output);
            process.stdout.write(output.join('\n'));
        })
        .catch(err => {
            log(
                chalk.red('X') +
                ' Something went wrong while importing ' +
                argv.source + ' into ' + argv.file +
                '!'
            );
            log('' + err.stack);
        });


}else if(argv._.includes('import')){
    const{ formatImportStringToTranslationObj }= require('./helpers/format-import-string');
    readFileAsync(path.resolve(argv.source))
        .then(filecontent => {
            //log(fileExtname(argv.source));
            return formatImportStringToTranslationObj(filecontent.toString(),fileExtname(argv.source))
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
            //log(filecontent);

            const options = {
                lang:argv.lang,
                sourceMode:argv.sourceMode,
                targetMode:argv.targetMode,
            }

            return importTrnslObjToXlf(filecontent,translationObj,options);
        })
        .then(output => {
            if(argv.target){
                return writeFileAsync(path.resolve(argv.target), output);
            }else{
                process.stdout.write(output);
            }
        })
        .catch(err => {
            log(
                chalk.red('X') +
                ' Something went wrong while importing ' +
                argv.source + ' into ' + argv.file +
                '!'
            );
            log('' + err.stack);
        });

}else if(argv._.includes('export')){
    readFileAsync(path.resolve(argv.file))
        .then(xlf => {
            return exportXlf(xlf.toString(),'csv');

        })
        .then(exportData => {
            const { formatExportCsv, formatExportPo, formatExportPhp, formatExportJs } = require('./helpers/format-export-string');
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
        })
        .catch(err => {
            log(
                chalk.red('X') +
                ' Something went wrong while exporting ' +
                argv.in +
                '!'
            );
            log('' + err.stack);
        });
}
