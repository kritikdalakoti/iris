'use strict';

var aesjs = require('aes-js');

export class PasswordEncryption {

    public key_258_array;

    constructor() {

        var key_256 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
            29, 30, 31];

        this.key_258_array = new Uint8Array(key_256);

    }


    encrypt(password) {
       
        var textBytes = aesjs.utils.utf8.toBytes(password);
    
        var aesCtr = new aesjs.ModeOfOperation.ctr(this.key_258_array);

        var encryptedBytes = aesCtr.encrypt(textBytes);

        // this.hash = aesjs.utils.hex.fromBytes(encryptedBytes);

        //To print or store the binary data, you may convert it to hex
        return aesjs.utils.hex.fromBytes(encryptedBytes);
    }

    validate(hash, password) {

        var encryptedBytes = aesjs.utils.hex.toBytes(hash);
        var aesCtr = new aesjs.ModeOfOperation.ctr(this.key_258_array);

        var decryptedBytes = aesCtr.decrypt(encryptedBytes);

        var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        return password == decryptedText;
    }

}

