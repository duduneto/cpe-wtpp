const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');



const asyncPromptQuestion = (question) => {
    const prompt_reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        prompt_reader.question(question, (answer) => {
            resolve(answer);
            prompt_reader.close()
        })
    })
}

const getGroupNameViaInputPrompt = async () => {
    const prompt_reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        prompt_reader.question("What is the Group Name or the Partial Group Name?", (answer) => {
            resolve(answer);
            prompt_reader.close()
        })
    })
}
const confirmGroupName = async (gpName) => {
    const prompt_reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve, reject) => {
        prompt_reader.question("The name/partial name of the group is: " + gpName + "\n\n Is it Correcy? (y/n)", (confirm_answer) => {
            if (confirm_answer.toLowerCase() === "n") {
                reject(false);
                process.exit();
            } else {
                resolve(true);
            }
            prompt_reader.close();
        })
    })
}

(async () => {
    const groupName = await getGroupNameViaInputPrompt();
    const confirm = await confirmGroupName(groupName);
    if (confirm) {
        initwwb(groupName);
    }
})()

const initwwb = (targetGpName) => {
    console.log('Initializign Bot...')
    const client = new Client();

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        try {
            
            console.log('Client is ready!');
            console.log('Getting Groups...')
            const chats = await client.getChats();
            const groupsChats = chats.filter(chat => chat.isGroup);
            const foundGroups = groupsChats.filter(chatGp => {
                return String(chatGp.name).toLowerCase().includes(String(targetGpName).toLowerCase());
            });
            
            const foundGroupsOnlyName = foundGroups.map(gp => gp.name);
    
            console.log("Groups found: \n", foundGroupsOnlyName.join("\n"), "\n Fim dos Grupos")
            const confirmGroups = await asyncPromptQuestion("Do you wanna leave these groups above? (y/n)\n")
    
            if (String(confirmGroups).toLocaleLowerCase() === "y") {
                for (const gp of foundGroups) {
                    await gp.leave();
                }
            }
        } catch (error) {
            console.error(error)
        }
    });


    client.initialize();
}
