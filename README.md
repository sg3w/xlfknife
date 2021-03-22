# xlfknife

A command-line utility to import and export xlf files. 

**DISCLAIMER**
This Software is pre-alpha 

## Usage

Update an existing language file with keys from the default file 

```bash
node ./src/index.js import ./examples/de.locallang.xlf --source=./examples/locallang.xlf --target=./output/de.locallang.xlf --lang=de
```


Export *.xlf file to csv

```bash
node ./src/index.js export ./examples/simple.xlf -o ./output/simple.xlf.csv
```