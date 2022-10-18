import Strings from "../lib/db";
import { ModuleCategory as Cat } from "../lib/moduleCategory";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization";
import { MessageType } from "../sidekick/message-type";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
import Axios from "axios";
const waifu= Strings.waifu;

export = {
    name: "waifu",
    description: waifu.DESCRIPTION,
    extendedDescription: waifu.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true },
    category: Cat.anime ,
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {
            const list_category = waifu.WAIFU_CATEGORY_SFW.split(" ");
            var wcategory = list_category[0];
            if (!args[0]) {
                const url = getWaifuUrl(wcategory);
                client.sendMessage(
                    BotsApp.chatId,
                    { url: url },
                    MessageType.image,
                    {
                        caption:"Waifu image generate by PharaonBot",
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }else if(args.length == 1){
                if(list_category.includes(args[0])){
                    const url = getWaifuUrl(args[0]);
                    client.sendMessage(
                    BotsApp.chatId,
                    { url: url },
                    MessageType.image,
                    {
                        caption:"Waifu image generate by PharaonBot",
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                }
            }
            client.sendMessage(
                BotsApp.chatId,
                waifu.EXTENDED_DESCRIPTION,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
            return

        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
    },
};

async function getWaifuUrl(wcategory){
    const url = "https://api.waifu.pics/";
    const wtype = "sfw";
    try{
        await Axios.get(url + wtype + "/" + wcategory)
        .then((res) => {
            return res.data.url;
        })
        .catch((error) => {
            console.log(error);
        });
    } catch (err) {
        console.log(err);
    }
}
