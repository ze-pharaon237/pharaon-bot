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
Object.defineProperty(exports, "__esModule", { value: true });
const input_sanitization_1 = __importDefault(require("../sidekick/input-sanitization"));
const fs_1 = __importDefault(require("fs"));
const db_1 = __importDefault(require("../lib/db"));
const moduleCategory_1 = require("../lib/moduleCategory");
const message_type_1 = require("../sidekick/message-type");
const GETDP = db_1.default.getdp;
module.exports = {
    name: "getdp",
    description: GETDP.DESCRIPTION,
    extendedDescription: GETDP.EXTENDED_DESCRIPTION,
    category: moduleCategory_1.ModuleCategory.group,
    demo: { isEnabled: true, text: ".getdp" },
    handle(client, chat, BotsApp, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const getDp = (jid) => __awaiter(this, void 0, void 0, function* () {
                let url;
                try {
                    url = yield client.sock.profilePictureUrl(jid, "image");
                }
                catch (_a) {
                    try {
                        url = yield client.sock.profilePictureUrl(jid);
                    }
                    catch (err) {
                        if (err.data === 404 || err.data === 401) {
                            return err;
                        }
                        else {
                            console.log('Error in getting profile pic - ' + console.log(err));
                        }
                    }
                }
                return url;
            });
            try {
                let url;
                if (!args[0]) {
                    url = yield getDp(BotsApp.chatId);
                }
                else {
                    let jid = args[0].split("@")[1] + "@s.whatsapp.net";
                    url = yield getDp(jid);
                }
                if (typeof (url) === 'object') {
                    yield client.sendMessage(BotsApp.chatId, fs_1.default.readFileSync("./images/default_dp.png"), message_type_1.MessageType.image, {
                        caption: "```This is the display picture visible to me. :P```",
                    });
                    return;
                }
                yield client.sendMessage(BotsApp.chatId, { url: url }, message_type_1.MessageType.image, {
                    caption: GETDP.IMAGE_CAPTION
                });
                return;
            }
            catch (err) {
                yield input_sanitization_1.default.handleError(err, client, BotsApp);
                return;
            }
        });
    },
};
//# sourceMappingURL=getdp.js.map