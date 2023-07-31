"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessagesHandlers {
    constructor() {
        this.nextMessageFlow = {
            '.cong': {
                type: 'pattern',
                value: 'string'
            },
            '.cong 1': {
                type: 'pattern',
                value: 'string'
            },
            '.cong 2': {
                type: 'pattern',
                value: 'string'
            }
        };
        this.botFeedbackMessages = {
            '.cong': 'Olá, o que você deseja fazer?\n 1 - Territórios 💼 \n 2 - Designações 🎤 \n Digite um dos números acima! 😊',
            '.cong 1': 'O que você deseja? \n 1 - Listar todos os Números de território\n 2 - Checar território\n Digite um dos números acima 😊',
            '.cong 2': 'O que você deseja? \n 1 - Ver as designações da Reunião\n 2 - Alterar alguma designação 😊'
        };
    }
    getMessageFlowItem(currentReceivedMessage) {
        return this.nextMessageFlow[currentReceivedMessage];
    }
    getFeedbackMessage(currentReceivedMessage) {
        return this.botFeedbackMessages[currentReceivedMessage];
    }
}
exports.default = new MessagesHandlers();
//# sourceMappingURL=Messages.js.map