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

        const getWaifuUrl = async (wcategory) => {
            const wurl = "https://api.waifu.pics/";
            const wtype = "sfw";
            let url;
            try{
                console.log(wurl + wtype + "/" + wcategory);
                await Axios.get(wurl + wtype + "/" + wcategory)
                .then((res) => {
                    url = res;
                    console.log(url.data);
                    console.log(url.data.url);
                    url = url.data.url;
                })
                .catch((error) => {
                    console.log("axios error : " + error);
                    url = "";
                });
            } catch (err) {
                console.log(err);
                url = "";
            }
            return url;
        }

        try {
            const list_category = waifu.WAIFU_CATEGORY_SFW.split(" ");
            var wcategory = list_category[0];

            if (!args[0]) {
                let url = await getWaifuUrl(wcategory);
                console.log("url = " + url );
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
                    let url = await getWaifuUrl(args[0]);
                    console.log("url = " + url);
                    client.sendMessage(
                        BotsApp.chatId,
                        { url: url },
                        MessageType.image,
                        {
                            caption:"Waifu image generate by PharaonBot",
                        }
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }else{
                    client.sendMessage(
                        BotsApp.chatId,
                        format(waifu.NOT_FOUND_CATEGORY, args[0]),
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }

            }else{
                client.sendMessage(
                BotsApp.chatId,
                waifu.EXTENDED_DESCRIPTION,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
            return
            }
        }catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        },
};
