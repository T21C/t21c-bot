import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder,
    RestOrArray,
    SelectMenuComponentOptionData,
    MessageActionRowComponentBuilder
} from 'discord.js'
import axios from 'axios'
import * as fs from 'fs'
import { apiHost, ytApiKey } from '../config.json'

import info from '../info.json'
const emojiData = info['emojis']
const colorData = info['pguDiffColors']

export const getVideoLinkType = (link) => {
    const ytShortUrlRegex = /youtu\.be\/([a-zA-Z0-9_-]{11})/
    const ytLongUrlRegex = /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/

    const ytShortMatch = link.match(ytShortUrlRegex)
    const ytLongMatch = link.match(ytLongUrlRegex)

    if (ytShortMatch || ytLongMatch) return 'YouTube'

    const bilibiliRegex =
        /https?:\/\/(www\.)?bilibili\.com\/video\/(BV[a-zA-Z0-9]+)\/?/
    if (link.match(bilibiliRegex)) return 'BiliBili'

    return 'Unknown'
}

export const createLevelEmbed = async (levelData, passesData) => {
    let levelThumbnail = `https://api.tuforums.com/v2/media/thumbnail/level/${levelData.level.id}/`

    const color = levelData.level.difficulty.color
    const firstPassData = passesData.sort(
        (a, b) =>
            new Date(a.vidUploadTime).getTime() -
            new Date(b.vidUploadTime).getTime()
    )[0]
    const scorePassData = passesData.sort((a, b) => b.scoreV2 - a.scoreV2)[0]
    const accPassData = passesData.sort((a, b) => b.accuracy - a.accuracy)[0]

    const formattedCreator = formatCreatorDisplay(levelData.level)

    const levelEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${levelData.level.artist} - ${levelData.level.song}`)
        .setDescription(`Level by ${formattedCreator}`)
        .setImage(levelThumbnail)
        .setTimestamp()
        .setFooter({ text: `ID: ${levelData.level.id}` })
        .addFields(
            { name: 'Tiles', value: `${levelData.tilecount}`, inline: true },
            { name: 'BPM', value: `${levelData.bpm}`, inline: true }
        )

    if (passesData.length > 0) {
        levelEmbed.addFields(
            {
                name: 'First Clear',
                value: `${firstPassData.player.name} (<t:${new Date(firstPassData.vidUploadTime).getTime() / 1000}:f>)`,
                inline: true
            },
            {
                name: 'Highest Accuracy',
                value: `${accPassData.player.name} (${Math.floor(accPassData.judgements.accuracy * 10000) / 100}%)`,
                inline: true
            },
            {
                name: 'Highest Score',
                value: `${scorePassData.player.name} (${scorePassData.scoreV2})`,
                inline: true
            }
        )
    }

    return levelEmbed
}

export const createLevelButtons = (levelData) => {
    levelData = levelData.level
    const levelButtonsRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel(getVideoLinkType(levelData.videoLink))
                .setEmoji({ id: emojiData['levelData']['youtube'] })
                .setURL(levelData.videoLink || 'https://tuforums.com')
                .setDisabled(!levelData.videoLink),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Download')
                .setEmoji({ id: emojiData['levelData']['download'] })
                .setURL(levelData.dlLink || 'https://tuforums.com')
                .setDisabled(!levelData.dlLink),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Workshop')
                .setEmoji({ id: emojiData['levelData']['workshop'] })
                .setURL(levelData.workshopLink || 'https://tuforums.com')
                .setDisabled(!levelData.workshopLink)
        ])
    const directAdofaiRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('TUF')
                .setEmoji({ id: '1215962674924355656' })
                .setURL(`https://tuforums.com/levels/${levelData.id}`)
            // new ButtonBuilder()
            // 	.setStyle(ButtonStyle.Link)
            // 	.setEmoji(':arrow_forward:')
            // 	.setURL(`t21c`)
        ])

    return [levelButtonsRow, directAdofaiRow]
}

export const createSearchSelectList = (
    levelList,
    page,
    totalPage,
    userId,
    sort = 'RECENT_DESC'
) => {
    const selectOptions: RestOrArray<SelectMenuComponentOptionData> = []

    for (const levelData of levelList) {
        const emoji = emojiData['pguDiff'][levelData.difficulty.name] || '🔢'

        const levelName = `${levelData.artist} - ${levelData.song}`
        let desc
        if (levelData.creator.length > 90 - levelData.id.toString().length) {
            desc = `by ${levelData.creator.slice(
                0,
                88 - levelData.id.toString().length
            )} | ID: ${levelData.id}`
        } else {
            desc = `by ${levelData.creator} | ID: ${levelData.id}`
        }
        selectOptions.push({
            label: levelName.slice(0, 100),
            description: desc,
            value: `showLevel_${levelData.id}`,
            emoji
        })
    }

    const levelSelectComponents: ActionRowBuilder<MessageActionRowComponentBuilder>[] =
        [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId(`showLevel_${userId}`)
                    .setPlaceholder('Please select a level.')
                    .addOptions(selectOptions)
            ]),
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
                new StringSelectMenuBuilder().setCustomId('sort').addOptions([
                    {
                        label: 'Newer Levels First',
                        value: 'RECENT_DESC',
                        emoji: { id: emojiData['sort']['RECENT_DESC'] },
                        default: sort === 'RECENT_DESC'
                    },
                    {
                        label: 'Older Levels First',
                        value: 'RECENT_ASC',
                        emoji: { id: emojiData['sort']['RECENT_ASC'] },
                        default: sort === 'RECENT_ASC'
                    },
                    {
                        label: 'Harder Levels First',
                        value: 'DIFF_DESC',
                        emoji: { id: emojiData['sort']['DIFF_DESC'] },
                        default: sort === 'DIFF_DESC'
                    },
                    {
                        label: 'Easier Levels First',
                        value: 'DIFF_ASC',
                        emoji: { id: emojiData['sort']['DIFF_ASC'] },
                        default: sort === 'DIFF_ASC'
                    },
                    {
                        label: 'Random',
                        value: 'RANDOM',
                        emoji: { id: emojiData['sort']['RANDOM'] },
                        default: sort === 'RANDOM'
                    }
                ])
            ]),
            new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page <= 1),
                new ButtonBuilder()
                    .setCustomId('page')
                    .setLabel(`${page} / ${totalPage}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page >= totalPage)
            ])
        ]

    return {
        content: 'Please select a level.',
        components: levelSelectComponents
    }
}

export const getTUFApi = async (endpoint, queryOptions?) => {
    const api = axios.create({
        baseURL: apiHost
    })
    return await api.get(endpoint, {
        params: queryOptions
    })
}

export const formatCreatorDisplay = (level) => {
    // If team exists, it takes priority
    if (!level) return ''

    if (level.team) {
        return level.team
    }

    // If no credits, fall back to creator field
    if (!level.levelCredits || level.levelCredits.length === 0) {
        return 'No credits'
    }

    // Group credits by role
    const creditsByRole = level.levelCredits.reduce((acc, credit) => {
        const role = credit.role.toLowerCase()
        if (!acc[role]) {
            acc[role] = []
        }
        const creatorName =
            credit.creator.aliases?.length > 0
                ? credit.creator.aliases[0]
                : credit.creator.name
        acc[role].push(creatorName)
        return acc
    }, {})

    const charters = creditsByRole['charter'] || []
    const vfxers = creditsByRole['vfxer'] || []

    // Handle different cases based on number of credits
    if (level.levelCredits.length >= 3) {
        const parts = []
        if (charters.length > 0) {
            parts.push(
                charters.length === 1
                    ? charters[0]
                    : `${charters[0]} & ${charters.length - 1} more`
            )
        }
        if (vfxers.length > 0) {
            parts.push(
                vfxers.length === 1
                    ? vfxers[0]
                    : `${vfxers[0]} & ${vfxers.length - 1} more`
            )
        }
        return parts.join(' | ')
    } else if (level.levelCredits.length === 2) {
        if (charters.length === 2) {
            return `${charters[0]} & ${charters[1]}`
        }
        if (charters.length === 1 && vfxers.length === 1) {
            return `${charters[0]} | ${vfxers[0]}`
        }
    }

    return level.levelCredits[0]?.creator.name || 'No credits'
}

export default {
    createLevelEmbed,
    createLevelButtons,
    createSearchSelectList,
    getTUFApi,
    formatCreatorDisplay
}
