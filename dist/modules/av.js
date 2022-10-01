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
const input_sanitization_1 = __importDefault(require("../sidekick/input-sanitization"));
const message_type_1 = require("../sidekick/message-type");
const av = db_1.default.av;
module.exports = {
    name: "av",
    description: av.DESCRIPTION,
    extendedDescription: av.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".av" },
    category: moduleCategory_1.ModuleCategory.game,
    handle(client, chat, BotsApp, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const buttons = [
                    { buttonId: "id1", buttonText: { displayText: "Action" }, type: 2 },
                    { buttonId: "id2", buttonText: { displayText: "Verité" }, type: 2 }
                ];
                const buttonMessage = {
                    text: "Alors : \nAction ou verité ?",
                    buttons: buttons,
                    headerType: 4
                };
                client.sendMessage(BotsApp.chatId, buttonMessage, message_type_1.MessageType.buttonsMessage).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
            }
            catch (err) {
                yield input_sanitization_1.default.handleError(err, client, BotsApp);
            }
        });
    },
};
//# sourceMappingURL=av.js.map