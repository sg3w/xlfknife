#! /usr/bin/env node

/*
    For usage help, run "node index.js help"
*/
const path = require('path');
const chalk = require('chalk');
const { readFileAsync, writeFileAsync } = require('./helpers/fs-async');
const exportXlf = require('./exportXlf');
const log = require('./helpers/log');

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
    .command('create <file> [options]', 'Create xlf from another file')
    .command('update <file> [options]', 'Create xlf from another file')
    .command('export <file> [options]', 'Exports XLF files to *.csv or *.po')
    /*
    .option('i', {
        alias: 'in',
        demand: false,
        describe: 'The input .xlf file to translate',
        type: 'string',
    })*/
    .option('o', {
        alias: 'out',
        demand: true,
        describe: 'The name of the output file',
        type: 'string',
    })
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
    .help()

    .argv;

// start a timer so that we can
// report how long the whole process took
const startTime = Date.now();
/*
console.log(argv);
console.log(argv._)
*/

if(argv._.includes('create')){
    console.log('create');
}else if(argv._.includes('export')){
    console.log(path.resolve(argv.file));
    readFileAsync(path.resolve(argv.file))
        // translate the file
        .then(xlf => {
            //console.log(xlf.toString());

            return exportXlf(xlf.toString(),'csv');
            //return translate(xlf.toString(), argv.from, argv.to, argv.rate, argv.skip);
        })
        .then(exportData => {
          log(exportData)  ;
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


// get the input .xlf file from the filesystem
/*
readFileAsync(path.resolve(argv.in))
    // translate the file
    .then(xlf => {
        return translate(xlf.toString(), argv.from, argv.to, argv.rate, argv.skip);
    })

    // write the result to the output file
    .then(output => {
        return writeFileAsync(path.resolve(argv.out), output);
    })

    // write a cheery message to the console
    .then(() => {
        const endTime = Date.now();
        log(
            chalk.green('✓') +
            ' Finished translating ' +
            argv.in +
            ' in ' +
            (endTime - startTime) +
            'ms.'
        );
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

 */