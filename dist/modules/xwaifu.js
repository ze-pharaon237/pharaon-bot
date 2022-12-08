"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const db_1 = __importDefault(require("../lib/db"));
const moduleCategory_1 = require("../lib/moduleCategory");
const string_format_1 = __importDefault(require("string-format"));
const input_sanitization_1 = __importDefault(require("../sidekick/input-sanitization"));
const message_type_1 = require("../sidekick/message-type");
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const form_data_1 = __importDefault(require("form-data"));
const xwaifu = db_1.default.xwaifu;
function gif2mp4(gifUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { data } = yield (0, axios_1.default)("https://ezgif.com/gif-to-mp4?url=" + gifUrl);
            const bodyFormThen = new form_data_1.default();
            var $ = cheerio_1.default.load(data);
            const file = $('input[name="file"]').attr('value');
            bodyFormThen.append('file', file);
            let res = yield (0, axios_1.default)({
                method: 'post',
                url: 'https://ezgif.com/gif-to-mp4/' + file,
                data: bodyFormThen,
                headers: {
                    'content-type': `application/x-www-form-urlencoded`
                }
            });
            $ = cheerio_1.default.load(res.data);
            const result = 'https:' + $('div#output > p.outfile > video > source').attr('src');
            return result;
        }
        catch (err) {
            console.log("gif2mp4 error = " + err);
        }
    });
}
module.exports = {
    name: "xwaifu",
    description: xwaifu.DESCRIPTION,
    extendedDescription: xwaifu.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".xwaifu",
            ".xwaifu neko"
        ],
    },
    category: moduleCategory_1.ModuleCategory.anime,
    handle(client, chat, BotsApp, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const getWaifuUrl = (wcategory) => __awaiter(this, void 0, void 0, function* () {
                const wurl = "https://api.waifu.pics/";
                const wtype = "nsfw";
                let url;
                try {
                    console.log(wurl + wtype + "/" + wcategory);
                    yield axios_1.default.get(wurl + wtype + "/" + wcategory)
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
                }
                catch (err) {
                    console.log(err);
                    url = "";
                }
                return url;
            });
            const send = (url) => __awaiter(this, void 0, void 0, function* () {
                let wurl = "";
                let mtype = "";
                if (url.includes('.gif')) {
                    mtype = message_type_1.MessageType.gif;
                    wurl = yield gif2mp4(url);
                }
                else {
                    mtype = message_type_1.MessageType.image;
                    wurl = url;
                }
                client.sendMessage(BotsApp.chatId, { url: wurl }, mtype, {
                    caption: "XWaifu image generate by PharaonBot",
                }).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                return;
            });
            try {
                const list_category = xwaifu.CATEGORY.split(" ");
                var wcategory = list_category[0];
                if (!args[0]) {
                    let url = yield getWaifuUrl(wcategory);
                    send(url);
                }
                else if (args.length == 1) {
                    if (list_category.includes(args[0])) {
                        let url = yield getWaifuUrl(args[0]);
                        send(url);
                    }
                    else {
                        let category = args[0];
                        client.sendMessage(BotsApp.chatId, (0, string_format_1.default)(xwaifu.NOT_FOUND_CATEGORY, category), message_type_1.MessageType.text).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                        return;
                    }
                }
                else {
                    client.sendMessage(BotsApp.chatId, xwaifu.EXTENDED_DESCRIPTION, message_type_1.MessageType.text).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                    return;
                }
            }
            catch (err) {
                yield input_sanitization_1.default.handleError(err, client, BotsApp);
                return;
            }
        });
    },
};
//# sourceMappingURL=xwaifu.js.map