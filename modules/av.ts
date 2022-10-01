import Strings from "../lib/db";
import { ModuleCategory as Cat } from "../lib/moduleCategory";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization";
import { MessageType } from "../sidekick/message-type";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
const av = Strings.av;

export = {
    name: "av",
    description: av.DESCRIPTION,
    extendedDescription: av.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".av" },
    category: Cat.game ,
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {

            const buttons = [
                {buttonId: "id1",buttonText: {displayText: "Action"},type: 2},
                {buttonId: "id2",buttonText: {displayText: "Verité"},type: 2}
            ];
            const buttonMessage = {
                text: "Alors : \nAction ou verité ?",
                buttons: buttons,
                headerType: 4
            }
            client.sendMessage(
                BotsApp.chatId,
                buttonMessage,
                MessageType.buttonsMessage
            ).catch(err => inputSanitization.handleError(err, client, BotsApp));

        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
    },
};
