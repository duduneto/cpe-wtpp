import MessagesHandler, { INextMessageFlowItem } from "./Messages";

export interface ISender {
    id: string;
    lastMessageAt: number;
    lastMessage: string;
    expectedNextMessage: INextMessageFlowItem | null;
}

class Senders {
    private wtppSenders: Record<string, ISender>;
    private expiresAt: number = 120000;
    constructor() {
        this.wtppSenders = {};
    }
    
    public setSender(id: string, currentReceivedMessage: string): void {
        this.wtppSenders[id] = {
            id,
            lastMessage: currentReceivedMessage,
            lastMessageAt: new Date().getTime(),
            expectedNextMessage: MessagesHandler.getMessageFlowItem(currentReceivedMessage) || null,
        }
    }

    public getSender(id: string): ISender | undefined {
        return this.wtppSenders[id];
    }

    public getNotExpiredSender(id: string): ISender | undefined {
        const found = this.wtppSenders?.[id];
        let result = undefined;
        if (found && !!((found.lastMessageAt + this.expiresAt) > new Date().getTime())) {
            result = found;
        }

        return result
    }
}

export default new Senders();