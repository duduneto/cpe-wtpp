"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Messages_1 = __importDefault(require("./Messages"));
class Senders {
    constructor() {
        this.wtppSenders = {};
    }
    setSender(id, currentReceivedMessage) {
        this.wtppSenders[id] = {
            id,
            lastMessage: currentReceivedMessage,
            lastMessageAt: new Date().getTime(),
            expectedNextMessage: Messages_1.default.getMessageFlowItem(currentReceivedMessage) || null,
        };
    }
    getSender(id) {
        return this.wtppSenders[id];
    }
}
exports.default = new Senders();
//# sourceMappingURL=Senders.js.map