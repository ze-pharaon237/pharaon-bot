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
import ffmpeg from "fluent-ffmpeg";
import { writeFile } from 'fs/promises';
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
            let wurl = "";
            let mtype = "";
            if(url.includes('.gif')){
                mtype = MessageType.gif;
                tomp4(url);
                wurl = "./tmp/fichier.mp4";
            }else{
                mtype = MessageType.image;
                wurl = url;
            }
            client.sendMessage(
                BotsApp.chatId,
                {url : wurl},
                mtype,
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

function tomp4(gifUrl){

    ffmpeg(gifUrl)
    .inputFormat('gif')
    .outputOptions(['-pix_fmt yuv420p', '-movflags frag_keyframe+empty_moov', '-movflags +faststart'])
    .toFormat('mp4')
    .save('./tmp/fichier.mp4')
    .on('error', function(err, stdout, stderr) {
        console.log('Cannot process video: ' + err.message);
    })
    .on('end', function() {
        console.log('Finished processing');
    });
}

async function gif2mp4(gifUrl) {
    try{
        const bodyForm: any = new FormData();
        bodyForm.append('new-image-url', gifUrl);
        bodyForm.append('new-image', "");
        let {data} = await Axios({
            method: 'post',
            url : "https://ezgif.com/gif-to-mp4",
            headers: {
                'Content-Type': `multipart/form-data boundary=${bodyForm._boundary}`
            }
        });
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
        console.log("gif2mp4 error = " + err);
    }
}
