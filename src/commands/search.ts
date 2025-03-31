import {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    InteractionContextType,
    ApplicationIntegrationType,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction
} from 'discord.js'
import levelUtils from '../utils/level'
import messageUtils from '../utils/message'
import { getRandomInt } from '../utils/general'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('wow search command')
        .addSubcommand((command) =>
            command
                .setName('level')
                .setDescription('Search for levels on T21+C')
                .addStringOption((option) =>
                    option
                        .setName('query')
                        .setDescription('General query to search')
                )
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
        if (interaction.options.getSubcommand() === 'level') {
            await interaction.deferReply()

            const query = interaction.options.getString('query')
            const queryOptions = {
                query,
                offset: 0,
                limit: 25,
                sort: 'RECENT_DESC',
                seed: null
            }

            const response = await levelUtils.getTUFApi(
                'database/levels',
                queryOptions
            )
            const results = response.data.results

            if (response.data.count === 0) {
                interaction.editReply('No levels were found.')
                return
            }

            if (response.data.count === 1) {
                const passesData = response.data.results[0].passes

                interaction.editReply({
                    embeds: [
                        await levelUtils.createLevelEmbed(
                            results[0],
                            passesData,
                            interaction
                        )
                    ],
                    components: levelUtils.createLevelButtons(results[0])
                })
                return
            }

            let offset = 0
            const count = response.data.count

            const msg = await interaction.editReply(
                levelUtils.createSearchSelectList(
                    results,
                    1,
                    Math.ceil(count / 25),
                    interaction.user.id
                )
            )

            const collector = msg.createMessageComponentCollector({
                filter: (i) =>
                    i.user.id === interaction.user.id &&
                    !i.customId.startsWith('showLevel'),
                time: 60000
            })

            collector.on('collect', async (i) => {
                if (i.customId === 'prev' || i.customId === 'next') {
                    if (i.customId === 'prev') {
                        offset -= 25
                        if (offset < 0) offset = 0
                    } else if (i.customId === 'next') {
                        offset += 25
                        if (offset > count) offset = count - 25
                    }

                    queryOptions.offset = offset
                    const newResponse = await levelUtils.getTUFApi(
                        'database/levels',
                        queryOptions
                    )
                    const newResults = newResponse.data.results
                    await interaction.editReply(
                        levelUtils.createSearchSelectList(
                            newResults,
                            Math.ceil(offset / 25) + 1,
                            Math.ceil(count / 25),
                            interaction.user.id
                        )
                    )

                    await i.deferUpdate()
                    return collector.resetTimer()
                } else if (i.customId === 'page') {
                    const modal = new ModalBuilder()
                        .setCustomId('pageModal')
                        .setTitle('Page Input')
                        .addComponents(
                            new ActionRowBuilder<TextInputBuilder>().addComponents(
                                new TextInputBuilder()
                                    .setCustomId('pageNum')
                                    .setStyle(TextInputStyle.Short)
                                    .setLabel('What page would you like to go?')
                                    .setPlaceholder(
                                        `1 - ${Math.ceil(count / 25)}`
                                    )
                                    .setRequired()
                            )
                        )
                    i.showModal(modal)

                    let modalResp
                    try {
                        modalResp = await i.awaitModalSubmit({
                            filter: (modalInt) =>
                                modalInt.user.id === interaction.user.id,
                            time: 30000
                        })
                    } catch (e) {
                        return
                    }

                    const newPage =
                        modalResp.fields.getTextInputValue('pageNum')
                    if (isNaN(+newPage)) {
                        modalResp.reply({
                            content: 'The page number specified was invalid!',
                            ephemeral: true
                        })
                        return
                    }
                    if (+newPage < 1 || +newPage > Math.ceil(count / 25)) {
                        modalResp.reply({
                            content:
                                'The page number specified was out of range!',
                            ephemeral: true
                        })
                        return
                    }

                    queryOptions.offset = (newPage - 1) * 25
                    const newResponse = await levelUtils.getTUFApi(
                        'database/levels',
                        queryOptions
                    )
                    const newResults = newResponse.data.results
                    await interaction.editReply(
                        levelUtils.createSearchSelectList(
                            newResults,
                            newPage,
                            Math.ceil(count / 25),
                            interaction.user.id
                        )
                    )

                    await modalResp.deferUpdate()
                    return collector.resetTimer()
                } else if (
                    i instanceof StringSelectMenuInteraction &&
                    i.customId === 'sort'
                ) {
                    await i.deferUpdate()

                    offset = 0

                    const sortOption = i.values[0]
                    queryOptions.sort = sortOption
                    if (sortOption === 'RANDOM') {
                        queryOptions.seed = getRandomInt(
                            Number.MIN_SAFE_INTEGER,
                            Number.MAX_SAFE_INTEGER
                        )
                    }

                    const newResponse = await levelUtils.getTUFApi(
                        'database/levels',
                        queryOptions
                    )
                    const newResults = newResponse.data.results
                    await interaction.editReply(
                        levelUtils.createSearchSelectList(
                            newResults,
                            1,
                            Math.ceil(count / 25),
                            interaction.user.id,
                            sortOption
                        )
                    )

                    return collector.resetTimer()
                }
            })

            collector.on('end', async () => {
                const message = await msg.fetch()
                if (message.components.length !== 3) return
                interaction.editReply({
                    components: messageUtils.disableComponents(
                        message.components,
                        ['showLevel']
                    )
                })
            })
        }
    }
}
