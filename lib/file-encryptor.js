var crypto = require('crypto'),
    fs = require('fs');

var Encryptor = {};

Encryptor.encryptFile = function(inputPath, outputPath, key, options, callback) {

  if(typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = Encryptor.combineOptions(options);

  var keyBuf = new Buffer(key);

  var inputStream = fs.createReadStream(inputPath);
  var outputStream = fs.createWriteStream(outputPath);
  var cipher = crypto.createCipher(options.algorithm, keyBuf);

  inputStream.on('data', function(data) {
    var buf = new Buffer(cipher.update(data), 'binary');
    outputStream.write(buf);
  });

  inputStream.on('end', function() {
    try {
      var buf = new Buffer(cipher.final('binary'), 'binary');
      outputStream.write(buf);
      outputStream.end();
      outputStream.on('close', function() {
        return callback();
      });
    } catch(e) {
      fs.unlink(outputPath);
      return callback(e);
    }
  });
};

Encryptor.decryptFile = function(inputPath, outputPath, key, options, callback) {

  if(typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = Encryptor.combineOptions(options);

  var keyBuf = new Buffer(key);

  var inputStream = fs.createReadStream(inputPath);
  var cipher = crypto.createDecipher(options.algorithm, keyBuf);
  var outputStream = '';

  if(options.saveDecryptFile === true) {
    outputStream = fs.createWriteStream(outputPath);
  }

  inputStream.on('data', function(data) {
    var buf = new Buffer(cipher.update(data), 'binary');
    
    if(options.saveDecryptFile === true) {
      outputStream.write(buf);
    } else {
      outputStream += buf.toString();
    }
  });

  inputStream.on('end', function() {
    try {
      var buf = new Buffer(cipher.final('binary'), 'binary');

      if(options.saveDecryptFile === true) {
        outputStream.write(buf);
        outputStream.end();
        outputStream.on('close', function() {
          return callback();
        });
      } else {
        outputStream += buf.toString();
        callback(null, outputStream);
      }

    } catch(e) {
      try {
        fs.unlinkSync(outputPath);
      } catch(fe) {}
      return callback(e);
    }
  });
};

Encryptor.combineOptions = function(options) {
  var result = {};
  for(var key in Encryptor.defaultOptions) {
    result[key] = Encryptor.defaultOptions[key];
  }

  for(var key in options) {
    result[key] = options[key];
  }

  return result;
};

Encryptor.defaultOptions = {
  algorithm: 'aes192',
  saveDecryptFile: true
};

module.exports = Encryptor;

