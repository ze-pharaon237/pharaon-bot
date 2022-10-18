import Strings from "../lib/db";
import { ModuleCategory as Cat } from "../lib/moduleCategory";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization";
import { MessageType } from "../sidekick/message-type";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
import Axios from "axios";
import cheerio from "cheerio";
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

        const send = (url) => {
            client.sendMessage(
                BotsApp.chatId,
                {url : ((url.includes('.gif')) ? gif2mp4(url) : url)},
                ((url.includes('.gif')) ? MessageType.gif : MessageType.image),
                {
                    caption:"Waifu image generate by PharaonBot",
                }
            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
        }

        try {
            const list_category = waifu.WAIFU_CATEGORY_SFW.split(" ");
            var wcategory = list_category[0];

            if (!args[0]) {
                let url = await getWaifuUrl(wcategory);
                send(url);

            }else if(args.length == 1){

                if(list_category.includes(args[0])){
                    let url = await getWaifuUrl(args[0]);
                   send(url);

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
                return;
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
            return;
        }
    },
};

async function gif2mp4(gifUrl) {
    try{
        let {data} = await Axios({
            method: 'get',
            url : "https://ezgif.com/gif-to-mp4?url=" + gifUrl
        });
        console.log(data);
        const bodyFormThen : any = new FormData();
        var $ = cheerio.load(data);
        const file = $('input[name="file"]').attr('value');
        const convert = $('input[name="file"]').attr('value');
        const gotdata = {
            file : file,
            convert : convert
        };
        bodyFormThen.append('file', gotdata.file);
        bodyFormThen.append('convert', gotdata.convert);
        let res = await Axios({
            method : 'post',
            url : 'https://ezgif.com/gif-to-mp4/' + gotdata.file,
            data: bodyFormThen,
            headers : {
            'content-type' : `multipart/form-data boundary=${bodyFormThen._boundary}`
            }
        });
        $ = cheerio.load(res.data)
            const result = 'https:' + $('div#output > p.outfile > video > source').attr('src');
            console.log("result : " + result)
            return result;
    } catch (err) {
        console.log(err);
    }
}
