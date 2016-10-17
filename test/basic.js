var encryptor = require('../lib/file-encryptor'),
    fs = require('fs'),
    path = require('path');

var key = 'My Super Secret Key';
var originalContent = fs.readFileSync('example.txt', {encoding: 'utf-8'});

var encrypt = function(input) {
  encryptor.encryptFile(
    path.join(__dirname, input),
    path.join(__dirname, input + '.data'),
    key,
    function(err) {
      console.log(input + ' encryption complete.');
      decrypt(input, input + '.data');
      decryptInMemory(input, input + '.data');
    }
  );
};

var decrypt = function(original, encrypted) {
  encryptor.decryptFile(
    path.join(__dirname, encrypted),
    path.join(__dirname, 'decrypted.' + original),
    key,
    function(err) {
      console.log(original + ' decryption complete.');
    }
  );
};

var decryptInMemory = function(original, encrypted) {
  var options = {
    saveDecryptFile: false
  };

  encryptor.decryptFile(
    path.join(__dirname, encrypted),
    path.join(__dirname, 'decrypted.' + original),
    key,
    options,
    function(err, data) {
      console.log('in memory decrypted: ', data === originalContent ? 'correct' : 'fail');
    }
  );
};

encrypt('example.txt');
