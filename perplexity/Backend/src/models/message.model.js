import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: [ 'user', 'ai' ],
            required: true,
        },
        quotedText: {
            type: String,
            default: null,
        },
        attachments: {
            type: [
                {
                    url: String,
                    fileId: String, // ImageKit ka ID — future mein delete karne ke kaam aayega
                    name: String,
                    mimeType: String,
                    kind: { type: String, enum: ["image", "document"] },
                },
            ],
            default: [],
        },
    },
    { timestamps: true }
);

const messageModel = mongoose.model('Message', messageSchema);

export default messageModel;