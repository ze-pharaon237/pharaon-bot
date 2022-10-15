import Strings from "../lib/db";
import { ModuleCategory as Cat } from "../lib/moduleCategory";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization";
import { MessageType } from "../sidekick/message-type";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
const love = Strings.love;

export = {
    name: "love",
    description: love.DESCRIPTION,
    extendedDescription: love.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    category: Cat.game ,
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {

           if (!BotsApp.isGroup) {
                client.sendMessage(
                    BotsApp.chatId,
                    Strings.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            if (!args[0]) {
                client.sendMessage(
                    BotsApp.chatId,
                    Strings.remove.INPUT_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            await client.getGroupMetaData(BotsApp.chatId, BotsApp);
            if(args.length == 2){
                var member1 = args[0].substring(1);
                var member2 = args[1].substring(1);
                var isMember1 = await inputSanitization.isMember(
                    member1,
                    BotsApp.groupMembers
                );
                var isMember2 = await inputSanitization.isMember(
                    member2,
                    BotsApp.groupMembers
                );
                if(!isMember1){
                    client.sendMessage(
                    BotsApp.chatId,
                    args[0] + " is not a group member",
                    MessageType.text,
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
                }
                if(!isMember2){
                    client.sendMessage(
                    BotsApp.chatId,
                    args[1] + " is not a group member",
                    MessageType.text,
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
                }
                var pourc = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
                let members = [member1+'@s.whatsapp.net', member2+'@s.whatsapp.net'];
                client.sendMessage(
                    BotsApp.chatId,
                    "for " + args[0] + " and " + args[1] + ", we have " + pourc + " %",
                    MessageType.text,
                    {
                        contextInfo: {
                            mentionedJid: members,
                        }
                    },
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            if(args.length == 3){
                client.sendMessage(
                BotsApp.chatId,
                "Ooh noo, please forget this 'plan à 3' ! ",
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
            return
            }
            client.sendMessage(
                BotsApp.chatId,
                love.EXTENDED_DESCRIPTION,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
            return

        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
    },
};
