/** Set of message types that are supported by the library */
export enum MessageType {
    text = 'conversation',
    extendedText = 'extendedTextMessage',
    contact = 'contactMessage',
    contactsArray = 'contactsArrayMessage',
    groupInviteMessage = 'groupInviteMessage',
    listMessage = 'listMessage',
    buttonsMessage = 'buttonsMessage',
    templateButtons = 'templateButtons',
    location = 'locationMessage',
    liveLocation = 'liveLocationMessage',

    image = 'imageMessage',
    video = 'videoMessage',
    gif = 'gifMessage',
    sticker = 'stickerMessage',
    document = 'documentMessage',
    audio = 'audioMessage',
    product = 'productMessage'
}
