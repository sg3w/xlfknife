var path = require('path');

function fileExtname(file,removeDot){
    return path.extname(file).substr(1).toLowerCase();
}

module.exports = { fileExtname };