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
const input_sanitization_1 = __importDefault(require("../sidekick/input-sanitization"));
const message_type_1 = require("../sidekick/message-type");
const axios_1 = __importDefault(require("axios"));
const promises_1 = require("fs/promises");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = __importDefault(require("fs"));
const quote = db_1.default.quote;
const getQuotly = (text, name, url) => __awaiter(void 0, void 0, void 0, function* () {
    let body = {
        "type": "quote",
        "format": "webp",
        "backgroundColor": "#1b1429",
        "width": 512,
        "height": 512,
        "scale": 2,
        "messages": [
            {
                "avatar": true,
                "from": {
                    "first_name": name,
                    "language_code": "en",
                    "name": name,
                    "photo": {
                        "url": url
                    }
                },
                "text": text,
                "replyMessage": {}
            }
        ]
    };
    let res = yield axios_1.default.post('https://bot.lyo.su/quote/generate', body);
    return Buffer.alloc(res.data.result.image.length, res.data.result.image, "base64");
});
module.exports = {
    name: "quote",
    description: quote.DESCRIPTION,
    extendedDescription: quote.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false, },
    handle(client, chat, BotsApp, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!BotsApp.isTextReply || (BotsApp.isTextReply && !BotsApp.replyMessage)) {
                    yield client.sendMessage(BotsApp.chatId, quote.NO_REPLY, message_type_1.MessageType.text);
                    return;
                }
                var downloading = yield client.sendMessage(BotsApp.chatId, quote.PROCESSING, message_type_1.MessageType.text);
                console.log(JSON.stringify(chat));
                const contact = ((_a = client.store) === null || _a === void 0 ? void 0 : _a.contacts[BotsApp.replyParticipant]) || undefined;
                let quotedReply = BotsApp.replyMessage.replace(/```/g, '');
                let name = (contact === null || contact === void 0 ? void 0 : contact.name) || (contact === null || contact === void 0 ? void 0 : contact.notify) || (BotsApp.replyParticipant === BotsApp.owner ? client.sock.user.name : BotsApp.replyParticipant.split("@")[0]);
                let fileName = './tmp/quote-' + chat.key.id;
                let stickerPath = './tmp/quote-' + chat.key.id + ".webp";
                let url;
                try {
                    url = yield client.sock.profilePictureUrl(BotsApp.replyParticipant, "image");
                }
                catch (err) {
                    try {
                        url = yield client.sock.profilePictureUrl(BotsApp.replyParticipant);
                    }
                    catch (_b) {
                        if (err.data === 404 || err.data === 401) {
                            url = "https://i.imgur.com/vjLIqgO.png";
                        }
                        else {
                            yield input_sanitization_1.default.handleError(err, client, BotsApp);
                        }
                    }
                }
                let img = yield getQuotly(quotedReply, name, url);
                yield (0, promises_1.writeFile)(fileName, img);
                (0, fluent_ffmpeg_1.default)(fileName)
                    .outputOptions(["-y", "-vcodec libwebp"])
                    .videoFilters("scale=2000:2000:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=2000:2000:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1")
                    .save(stickerPath)
                    .on("end", () => __awaiter(this, void 0, void 0, function* () {
                    yield client.sendMessage(BotsApp.chatId, fs_1.default.readFileSync(stickerPath), message_type_1.MessageType.sticker).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                    yield input_sanitization_1.default.deleteFiles(fileName, stickerPath);
                    yield client.deleteMessage(BotsApp.chatId, {
                        id: downloading.key.id,
                        remoteJid: BotsApp.chatId,
                        fromMe: true,
                    }).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                }))
                    .on('error', (err) => __awaiter(this, void 0, void 0, function* () {
                    input_sanitization_1.default.handleError(err, client, BotsApp);
                    yield client.deleteMessage(BotsApp.chatId, {
                        id: downloading.key.id,
                        remoteJid: BotsApp.chatId,
                        fromMe: true,
                    }).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                }));
            }
            catch (err) {
                yield client.deleteMessage(BotsApp.chatId, {
                    id: downloading.key.id,
                    remoteJid: BotsApp.chatId,
                    fromMe: true,
                }).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                yield input_sanitization_1.default.handleError(err, client, BotsApp);
            }
        });
    },
};
//# sourceMappingURL=quote.js.map