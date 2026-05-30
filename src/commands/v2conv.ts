import axios from 'axios'
import {
    SlashCommandBuilder,
    InteractionContextType,
    ApplicationIntegrationType,
    ChatInputCommandInteraction,
    AttachmentBuilder
} from 'discord.js'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('v2conv')
        .setDescription('convert a v3 adofai file into a v2-compatible format.')
        .addAttachmentOption((option) =>
            option
                .setName('file')
                .setDescription('adofai file to convert')
                .setRequired(true)
        )
        .setIntegrationTypes(
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        )
        .setContexts(
            InteractionContextType.BotDM,
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const file = interaction.options.getAttachment('file', true)
        await interaction.deferReply()

        if (!file.name.endsWith('.adofai')) {
            await interaction.editReply('Error: File must be an ADOFAI file')
            return
        }

        let adofaiData
        try {
            const adofaiFile = await axios.get(file.url, {
                responseType: 'arraybuffer',
                timeout: 5000 // prevent hanging
            })
            adofaiData = JSON.parse(
                Buffer.from(adofaiFile.data).toString('utf8').trim()
            )
        } catch (error) {
            await interaction.editReply('error: invalid file')
            return
        }

        if (!adofaiData.settings || !Array.isArray(adofaiData.actions)) {
            await interaction.editReply('error: invalid file')
            return
        }

        adofaiData.settings.version = 15
        adofaiData.actions = adofaiData.actions.map((a) => {
            if (a.eventType !== 'SetFilterAdvanced') return a
            a.filterProperties = JSON.stringify(a.filterProperties).slice(1, -1)
            return a
        })

        const attachment = new AttachmentBuilder(
            Buffer.from(JSON.stringify(adofaiData)),
            {
                name: `${file.name.replace(/\.[^.]+$/, '')}_v2conv.adofai`
            }
        )

        await interaction.editReply({ files: [attachment] })
    }
}
