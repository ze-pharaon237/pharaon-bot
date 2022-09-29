"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const pino_1 = __importDefault(require("pino"));
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
// @ts-ignore
const dbAuth_js_1 = require("./core/dbAuth.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const config_1 = __importDefault(require("./config"));
const banner_1 = require("./lib/banner");
const chalk_1 = __importDefault(require("chalk"));
const db_1 = __importDefault(require("./lib/db"));
const blacklist_1 = __importDefault(require("./database/blacklist"));
const clearance_1 = __importDefault(require("./core/clearance"));
const helper_1 = __importDefault(require("./core/helper"));
const client_1 = __importDefault(require("./sidekick/client"));
const message_type_1 = require("./sidekick/message-type");
const sequelize = config_1.default.DATABASE;
const GENERAL = db_1.default.general;
const msgRetryCounterMap = {};
const logger = (0, pino_1.default)({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({});
logger.level = 'fatal';
// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = (0, baileys_1.makeInMemoryStore)({ logger });
store === null || store === void 0 ? void 0 : store.readFromFile('./session.data.json');
// save every 10s
setInterval(() => {
    store === null || store === void 0 ? void 0 : store.writeToFile('./session.data.json');
}, 10000);
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(banner_1.banner);
    let commandHandler = new Map();
    console.log(chalk_1.default.yellowBright.bold("[INFO] Installing Plugins... Please wait."));
    let moduleFiles = fs_1.default.readdirSync((0, path_1.join)(__dirname, 'modules')).filter((file) => file.endsWith('.js'));
    for (let file of moduleFiles) {
        try {
            const command = require((0, path_1.join)(__dirname, 'modules', `${file}`));
            console.log(chalk_1.default.magentaBright("[INFO] Successfully imported module"), chalk_1.default.cyanBright.bold(`${file}`));
            commandHandler.set(command.name, command);
        }
        catch (error) {
            console.log(chalk_1.default.blueBright.bold("[INFO] Could not import module"), chalk_1.default.redBright.bold(`${file}`));
            console.log(`[ERROR] `, error);
            continue;
        }
    }
    console.log(chalk_1.default.green.bold("[INFO] Plugins Installed Successfully. The bot is ready to use."));
    console.log(chalk_1.default.yellowBright.bold("[INFO] Connecting to Database."));
    try {
        yield sequelize.authenticate();
        console.log(chalk_1.default.greenBright.bold('[INFO] Connection has been established successfully.'));
    }
    catch (error) {
        console.error('[ERROR] Unable to connect to the database:', error);
    }
    console.log(chalk_1.default.yellowBright.bold("[INFO] Syncing Database..."));
    yield sequelize.sync();
    console.log(chalk_1.default.greenBright.bold("[INFO] All models were synchronized successfully."));
    let firstInit = true;
    const startSock = () => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        const { state, saveCreds } = yield (0, dbAuth_js_1.useRemoteFileAuthState)();
        const { version, isLatest } = yield (0, baileys_1.fetchLatestBaileysVersion)();
        const sock = (0, baileys_1.default)({
            version,
            logger,
            printQRInTerminal: true,
            auth: state,
            browser: ["BotsApp", "Chrome", "4.0.0"],
            msgRetryCounterMap,
            // implement to handle retries
            getMessage: (key) => __awaiter(void 0, void 0, void 0, function* () {
                if (store) {
                    const msg = yield store.loadMessage(key.remoteJid, key.id, undefined);
                    return (msg === null || msg === void 0 ? void 0 : msg.message) || undefined;
                }
                return {
                    conversation: '-pls ignore-'
                };
            })
        });
        store === null || store === void 0 ? void 0 : store.bind(sock.ev);
        let client = new client_1.default(sock, store);
        sock.ev.process((events) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            if (events['connection.update']) {
                const update = events['connection.update'];
                const { connection, lastDisconnect } = update;
                if (connection === 'close') {
                    if (((_b = (_a = lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== baileys_1.DisconnectReason.loggedOut) {
                        startSock();
                    }
                    else {
                        console.log(chalk_1.default.redBright('Connection closed. You are logged out. Delete the BotsApp.db and session.data.json files to rescan the code.'));
                        process.exit(0);
                    }
                }
                else if (connection === 'connecting') {
                    console.log(chalk_1.default.yellowBright("[INFO] Connecting to WhatsApp..."));
                }
                else if (connection === 'open') {
                    console.log(chalk_1.default.greenBright.bold("[INFO] Connected! Welcome to BotsApp"));
                }
            }
            if (events['creds.update']) {
                yield saveCreds();
            }
            if (events['contacts.upsert']) {
                const contacts = events['contacts.upsert'];
                const contactsUpdate = (newContacts) => {
                    for (const contact of newContacts) {
                        if (store.contacts[contact.id]) {
                            Object.assign(store.contacts[contact.id], contact);
                        }
                        else {
                            store.contacts[contact.id] = contact;
                        }
                    }
                    return;
                };
                contactsUpdate(contacts);
            }
            if (events['contacts.update']) {
                const contacts = events['contacts.update'];
                const contactsUpdate = (newContacts) => {
                    for (const contact of newContacts) {
                        if (store.contacts[contact.id]) {
                            Object.assign(store.contacts[contact.id], contact);
                        }
                        else {
                            store.contacts[contact.id] = contact;
                        }
                    }
                    return;
                };
                contactsUpdate(contacts);
            }
            if (events['messages.upsert']) {
                const upsert = events['messages.upsert'];
                // console.log(JSON.stringify(upsert, undefined, 2))
                if (upsert.type !== 'notify') {
                    return;
                }
                for (const msg of upsert.messages) {
                    let chat = msg;
                    let BotsApp = yield (0, helper_1.default)(chat, sock);
                    // console.log(BotsApp);
                    if (BotsApp.isCmd) {
                        let isBlacklist = yield blacklist_1.default.getBlacklistUser(BotsApp.sender, BotsApp.chatId);
                        const cleared = yield (0, clearance_1.default)(BotsApp, client, isBlacklist);
                        if (!cleared) {
                            return;
                        }
                        const reactionMessage = {
                            react: {
                                text: "🪄",
                                key: chat.key,
                            }
                        };
                        yield sock.sendMessage(chat.key.remoteJid, reactionMessage);
                        console.log(chalk_1.default.redBright.bold(`[INFO] ${BotsApp.commandName} command executed.`));
                        const command = commandHandler.get(BotsApp.commandName);
                        var args = BotsApp.body.trim().split(/\s+/).slice(1);
                        if (!command) {
                            client.sendMessage(BotsApp.chatId, "```Woops, invalid command! Use```  *.help*  ```to display the command list.```", message_type_1.MessageType.text);
                            return;
                        }
                        else if (command && BotsApp.commandName == "help") {
                            try {
                                command.handle(client, chat, BotsApp, args, commandHandler);
                                return;
                            }
                            catch (err) {
                                console.log(chalk_1.default.red("[ERROR] ", err));
                                return;
                            }
                        }
                        try {
                            yield command.handle(client, chat, BotsApp, args).catch(err => console.log("[ERROR] " + err));
                        }
                        catch (err) {
                            console.log(chalk_1.default.red("[ERROR] ", err));
                        }
                    }
                }
            }
        }));
        return sock;
    });
    startSock();
}))().catch(err => console.log('[MAINERROR] : %s', chalk_1.default.redBright.bold(err)));
;
//# sourceMappingURL=BotsApp.js.map