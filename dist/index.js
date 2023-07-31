"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const venom_bot_1 = __importDefault(require("venom-bot"));
const Senders_1 = __importDefault(require("./handlers/Senders"));
const Messages_1 = __importDefault(require("./handlers/Messages"));
venom_bot_1.default
    .create({
    session: 'session-name',
    multidevice: true // for version not multidevice use false.(default: true)
})
    .then((client) => start(client))
    .catch((erro) => {
    console.log(erro);
});
function start(client) {
    client.onMessage((message) => {
        console.log('message => ', message);
        if (message.body.includes('.cong')) {
            Senders_1.default.setSender(message.sender.id, message.body);
            client
                .sendText(message.from, Messages_1.default.getFeedbackMessage(message.body))
                .then((result) => {
                console.log('Result: ', result); //return object success
            })
                .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
            });
        }
    });
}
//# sourceMappingURL=index.js.map