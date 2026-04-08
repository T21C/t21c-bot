import {
    SlashCommandBuilder,
    InteractionContextType,
    ApplicationIntegrationType,
    ChatInputCommandInteraction
} from 'discord.js'
import levelUtils from '../utils/level'
import { AxiosError } from 'axios'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Gets a level by ID')
        .addNumberOption((option) =>
            option
                .setName('id')
                .setDescription('ID of the level')
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
        await interaction.deferReply()

        const id = interaction.options.getNumber('id')

        let levelResponse, passResponse
        try {
            levelResponse = await levelUtils.getTUFApi(`database/levels/${id}`)
            passResponse = await levelUtils.getTUFApi(
                `database/passes/level/${id}`
            )
        } catch (err) {
            if (err.response.status === 404) {
                await interaction.editReply('The level could not be found.')
                return
            } else {
                console.error(err)
            }
        }
        const levelData = levelResponse.data
        const passesData = passResponse.data

        console.log(passResponse)

        const levelEmbed = await levelUtils.createLevelEmbed(
            levelData,
            passesData
        )
        const levelButtonsRow = levelUtils.createLevelButtons(levelData)

        await interaction.editReply({
            embeds: [levelEmbed],
            components: levelButtonsRow
        })
    }
}
