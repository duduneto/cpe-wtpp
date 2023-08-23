const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const fs = require("fs");
const util = require('util');
const CPE_Data_Input = require('../inputs/settings.json');

const readFileAsync = util.promisify(fs.readFile);

const RUN_TIME_MODE = process.argv[2];

const numbersFilePath = 'inputs/numbers.txt';
const scheduledMessageFilePath = 'inputs/scheduled_message.txt';
const userLeftGroupMessageFilePath = 'inputs/left_group_message.txt';
let wtppNumbersRaw;
let scheduledMessageRaw;
let userLeftGroupMessageRaw;
(async () => {
  try {
    const fileConsultingResult = await Promise.all([
        readFileAsync(numbersFilePath, 'utf8'),
        readFileAsync(scheduledMessageFilePath, 'utf8'),
        readFileAsync(userLeftGroupMessageFilePath, 'utf8'),
    ])
    wtppNumbersRaw = fileConsultingResult[0];
    scheduledMessageRaw = fileConsultingResult[1];
    userLeftGroupMessageRaw = fileConsultingResult[2];
  } catch (err) {
    console.error('Error reading the file:', err);
  }
})();


const sendMessageToList = async (client) => {
    const numbersAsList = [];
    wtppNumbersRaw.split(',').forEach((phoneNum) => {
        const sanitizedPhoneNum = phoneNum.replace(/[^0-9]/g, '');
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
    
    console.log('Message: ', scheduledMessageRaw);
    for (let i = 0; i < phoneNumbers.length; i++) {
        try {
            // await client.sendMessage(phoneNumbers[i],scheduledMessageRaw);
            console.log(phoneNumbers[i], ' sent \u2713')
        } catch (error) {
            console.log(phoneNumbers[i], ' NOT sent \u274c')
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

const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');
    if(RUN_TIME_MODE === '--send-messages') {
        sendMessageToList(client)
    }
});

client.on('message', async (msg) => {
   
});
client.on('group_leave', async (notification) => {
    if(RUN_TIME_MODE === '--monitor-group') {
        // User has left or been kicked from the group.
        const numberLeftId = notification.author;
        const chat = await notification.getChat();
        const groupName = chat?.name;
        if(CPE_Data_Input.monitoring_groups.includes(groupName)) {

            console.log('User Left: ', numberLeftId, ' --- Scheduling Message ',  '\u23f2')
            
            setTimeout(async () => {
                await client.sendMessage(numberLeftId,userLeftGroupMessageRaw);
                console.log('Scheduled Messaged Sent to: ', numberLeftId,  '  \u2713')
            }, 120000)
        }
    }
});

client.initialize();