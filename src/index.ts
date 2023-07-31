import Senders from './handlers/Senders';
import MessagesHandler from './handlers/Messages'
import { Message, create as venomCreate } from 'venom-bot';
import CPE_Data_Input from '../inputs/cpe.json';

venomCreate('cpe-wtpp-bot')
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });


const {
  contacts: phoneNumbers,
  message,
  bulk_phone_numbers
} = CPE_Data_Input;

const sendMessageToList = async (client) => {
  const numbersAsList = [];
  bulk_phone_numbers.split(',').forEach((phoneNum: string) => {
    const sanitizedPhoneNum = phoneNum.replace(/[^0-9]/g, '');
    if(sanitizedPhoneNum) {
      numbersAsList.push(sanitizedPhoneNum)
    }
  })

  const promiseNumMessagesSent = numbersAsList.map((phoneNum: string) => {
  client.sendText(phoneNum+'@c.us', message)
  });
  const erroToSend = [];

  try {
    await Promise.all(promiseNumMessagesSent)
  } catch (error) {
    if(error?.to) {
      erroToSend.push(error.to)
    }
    console.error(error)
  }
}

function start(client) {
  client.onMessage(async (message: Message) => {
    // console.log("Message => ", message)
  });
  sendMessageToList(client)
}