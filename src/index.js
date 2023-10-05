const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const fs = require("fs");
const util = require('util');
const path = require('path');
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
    const {
        send_bulk_messages: {
            delay_every_message
        },
    } = CPE_Data_Input;

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

    const sendMessagesWithDelay = async (listNumbers) => {
        if(listNumbers.length) {
            const firstNumberInList = listNumbers.splice(0,1)
            const phoneNumber = firstNumberInList[0];
            try {
                await client.sendMessage(phoneNumber,scheduledMessageRaw);
                console.log(phoneNumber, ' sent \u2713')
            } catch (error) {
                console.log(phoneNumber, ' - WILL NOT sent \u274c')
                if (error?.to) {
                    erroToSend.push({
                        phoneNumber: error.to,
                        reason: error.text
                    })
                }
            }
            setTimeout(() => {
                sendMessagesWithDelay(listNumbers)
            },
                delay_every_message || 0
            )
        }
    }

    sendMessagesWithDelay(phoneNumbers)

    console.log(green, 'All Numbers sent!', reset)
    console.log('erroToSend => ', erroToSend)
    saveNotSentNumbers(erroToSend)
}


function saveNotSentNumbers(numbersAsList) {
    if (numbersAsList.length) {
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
    if (RUN_TIME_MODE === '--send-messages') {
        sendMessageToList(client)
    }
});

client.on('message', async (msg) => {

});
client.on('group_leave', async (notification) => {
    if (RUN_TIME_MODE === '--monitor-group') {

        const {
            monitoring_groups,
        } = CPE_Data_Input;

        // Get the current local time
        const currentLocalTime = new Date();
        const currentHour = currentLocalTime.getHours();

        // User has left or been kicked from the group.
        const numberLeftId = notification.author;
        const chat = await notification.getChat();
        const groupName = chat?.name;
        if (monitoring_groups.names.includes(groupName)) {
            console.log('User Left: ', numberLeftId, ' Out of Time. Saving it ', '\uf634')

            if (currentHour >= monitoring_groups.snooze_range.hour[0] || currentHour < monitoring_groups.snooze_range.hour[1]) {

                // Append the number to the file
                const filePath = path.join('outputs/out_time_left_group_event.txt');
                const numberToAppend = ','+numberLeftId; // Include a newline after the number

                fs.appendFile(filePath, numberToAppend, (err) => {
                    if (err) {
                        console.error('Error appending to file:', err);
                    } else {
                        console.log('Number appended to file:', numberLeftId);
                    }
                });

            } else {
                console.log('User Left: ', numberLeftId, ' --- Scheduling Message ', '\u23f2')

                setTimeout(async () => {
                    await client.sendMessage(numberLeftId, userLeftGroupMessageRaw);
                    console.log('Scheduled Messaged Sent to: ', numberLeftId, '  \u2713')
                }, monitoring_groups.delay_msg)
            }

        }
    }
});

client.initialize();