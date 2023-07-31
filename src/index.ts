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
} = CPE_Data_Input;

const sendMessageToList = async (client) => {
  const promiseNumMessagesSent = phoneNumbers.map((phoneNum: string) => {
  const sanitizedPhoneNum = phoneNum.replace(/[^0-9]/g, '');
  console.log("sanitizedPhoneNum => ", sanitizedPhoneNum)
  client.sendText(sanitizedPhoneNum+'@c.us', message)
  });
  try {
    await Promise.all(promiseNumMessagesSent)
  } catch (error) {
    console.error(error)
  }
}

function start(client) {
  client.onMessage(async (message: Message) => {
    // console.log("Message => ", message)
  });
  sendMessageToList(client)
}