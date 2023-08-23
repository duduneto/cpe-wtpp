const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require("fs");

const CPE_Data_Input = require('../inputs/cpe.json');


const {
    contacts: phoneNumbers,
    message,
    bulk_phone_numbers
  } = CPE_Data_Input;

const sendMessageToList = async (client) => {
    const numbersAsList = [];
    bulk_phone_numbers.split(',').forEach((phoneNum) => {
        const splitNum = phoneNum.split(" ");
        if(splitNum[splitNum.length-1].length === 10 && splitNum[splitNum.length-1][0] == 9) {
            splitNum[splitNum.length-1] = splitNum[splitNum.length-1].substring(1)
        }
        const joinedNum = splitNum.join("")
        
        const sanitizedPhoneNum = joinedNum.replace(/[^0-9]/g, '');
        if (sanitizedPhoneNum) {
            numbersAsList.push(sanitizedPhoneNum)
        }
    })

    const phoneNumbers = numbersAsList.map((phoneNum) => {
        return phoneNum.trim() + '@c.us'
    });
    const erroToSend = [];

    const reset = '\x1b[0m';
    const yellow = '\x1b[33m';
    const green = '\x1b[32m';

    console.log(yellow, 'Sending Messages...', reset)

    for (let i = 0; i < phoneNumbers.length; i++) {
        try {
            console.log(phoneNumbers[i], message);
            await client.sendMessage(phoneNumbers[i],message);
        } catch (error) {

            if (error?.to) {
                erroToSend.push({
                    phoneNumber: error.to,
                    reason: error.text
                })
            }
        }
    }

    console.log(green, 'All Numbers sent!', reset)
    console.log('erroToSend => ', erroToSend)
    saveNotSentNumbers(erroToSend)
}


function saveNotSentNumbers(numbersAsList) {
    if(numbersAsList.length) {
        fs.writeFile('errors/errorNumbers.' + new Date().getTime() + '.json', JSON.stringify({
            phoneNumbersNotSent: numbersAsList
        }, null, 2), (err) => {
            if (err) {
                console.error('Error writing JSON file:', err);
            } else {
                console.log('JSON file has been created!');
            }
        });
    }

}

const client = new Client({
    puppeteer: {
        headless: true
    }
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');
    sendMessageToList(client)
});

client.on('message', async (msg) => {
   
});

client.initialize();