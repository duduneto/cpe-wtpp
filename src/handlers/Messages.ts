
export interface INextMessageFlowItem {
    type: 'pattern' | 'value';
    value: string;
}

class MessagesHandlers {
    private nextMessageFlow: Record<string, INextMessageFlowItem> = {
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
    }

    private botFeedbackMessages: Record<string, string> = {
        '.cong': 'Olá, o que você deseja fazer?\n 1 - Territórios 💼 \n 2 - Designações 🎤 \n Digite um dos números acima! 😊',
        '.cong 1': 'O que você deseja? \n 1 - Listar territórios trabalhados recentemente\n 2 - Listar Territórios mais antigos trabalhados\n 3 - Checar território\n Digite um dos números acima 😊',
        '.cong 1 1': 'No.1 - (_10/10/2023_)\n No.2 - (_12/11/2023_) \n No.3 - (_10/08/2023_) \n ...',
        '.cong 1 2': 'No.27 - (_10/10/2020_)\n No.23 - (_12/11/2022_) \n No.11 (_10/08/2023_) \n ...',
        '.cong 1 3 27': '```No.27``` - atualizada em: _10/10/2020_\n```Status```: *em aberto* \n```Quadras faltantes```: \n  *A*\n  *B* (_Apenas o lado da rua Dr. José Frota_)\n  *D*\n```Quadras fechadas```: \n  *E*,*F*\n```Ultimo Dirigente```: *Paulo Lacélio* \n \n Deseja Atualizar este Território? Digite:\n  S - para Sim',
        '.cong 1 3': 'Digite o número do Território que você deseja.',
        '.cong 2': 'O que você deseja? \n 1 - Ver as designações da Reunião\n 2 - Alterar alguma designação 😊'
    }
    
    public getMessageFlowItem(currentReceivedMessage: string): INextMessageFlowItem {
        return this.nextMessageFlow[currentReceivedMessage];
    }

    public getFeedbackMessage(currentReceivedMessage: string) :string {
        return this.botFeedbackMessages[currentReceivedMessage];
    }
}

export default new MessagesHandlers();