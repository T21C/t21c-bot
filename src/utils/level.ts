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

export const createLevelEmbed = async (levelData, passesData, interaction) => {
    const ytShortUrlRegex = /youtu\.be\/([a-zA-Z0-9_-]{11})/
    const ytLongUrlRegex = /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/

    const ytShortMatch = levelData.videoLink.match(ytShortUrlRegex)
    const ytLongMatch = levelData.videoLink.match(ytLongUrlRegex)
    let videoId = ytShortMatch
        ? ytShortMatch[1]
        : ytLongMatch
          ? ytLongMatch[1]
          : null
    let levelThumbnail =
        'https://media.discordapp.net/attachments/1142069717612372098/1146082697198960650/dsdadd.png'

    if (videoId) {
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${ytApiKey}&part=snippet,contentDetails`
        const ytVideoRequest = await axios.get(apiUrl)
        const data = ytVideoRequest.data

        levelThumbnail =
            data.items[0].snippet.thumbnails?.maxres?.url ||
            data.items[0].snippet.thumbnails?.high?.url ||
            data.items[0].snippet.thumbnails?.medium?.url ||
            data.items[0].snippet.thumbnails?.default?.url
    } else {
        const urlRegex =
            /https?:\/\/(www\.)?bilibili\.com\/video\/(BV[a-zA-Z0-9]+)\/?/
        const match = levelData.videoLink.match(urlRegex)
        const videoId = match ? match[2] : null

        if (videoId) {
            levelThumbnail = await axios
                .get(
                    `https://api.tuforums.com/v2/media/bilibili/?bvid=${videoId}`
                )
                .then((r) => r.data.data.pic)
        }
    }

    const color = !colorData[levelData.difficulty.name]
        ? colorData['0']
        : colorData[levelData.difficulty.name]

    const diffSet = getDiffSet(interaction.user.id)

    let diffEmoji

    diffEmoji = `${interaction.client.emojis.cache
        .get(diffSet[levelData.difficulty.name])
        .toString()}`
    if (emojiData['diff'][levelData.difficulty.legacy]) {
        diffEmoji += ` | ${interaction.client.emojis.cache
            .get(emojiData['diff'][levelData.difficulty.legacy])
            .toString()}`
    }

    const bestPassData = passesData.sort((a, b) => b.scoreV2 - a.scoreV2)

    const levelEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${levelData.artist} - ${levelData.song}`)
        .setDescription(`Level by ${levelData.creator}`)
        .addFields(
            {
                name: 'Difficulty',
                value: diffEmoji,
                inline: true
            },
            {
                name: 'Clears',
                value: `${passesData.length}`,
                inline: true
            }
        )
        .setImage(levelThumbnail)
        .setTimestamp()
        .setFooter({ text: `ID: ${levelData.id}` })

    if (passesData.count > 0) {
        levelEmbed.addFields({
            name: 'Best Clear',
            value: `${bestPassData.player} (${
                Math.round(bestPassData.scoreV2 * 100) / 100
            })`,
            inline: true
        })
    }

    return levelEmbed
}

export const createLevelButtons = (levelData) => {
    const levelButtonsRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel(getVideoLinkType(levelData.videoLink))
                .setEmoji({ id: emojiData['levelData']['youtube'] })
                .setURL(levelData.videoLink || 'https://t21c-adofai.kro.kr')
                .setDisabled(!levelData.videoLink),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Download')
                .setEmoji({ id: emojiData['levelData']['download'] })
                .setURL(levelData.dlLink || 'https://t21c-adofai.kro.kr')
                .setDisabled(!levelData.dlLink),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Workshop')
                .setEmoji({ id: emojiData['levelData']['workshop'] })
                .setURL(levelData.workshopLink || 'https://t21c-adofai.kro.kr')
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
        const diffSet = getDiffSet(userId)

        const emoji = !diffSet[levelData.difficulty.name]
            ? '🔢'
            : { id: diffSet[levelData.difficulty.name] }

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

export const getDiffSet = (userId) => {
    const userPrefs = JSON.parse(fs.readFileSync('users.json', 'utf8'))
    if (!userPrefs[userId]) {
        userPrefs[userId] = { iconset: 'default' }
        fs.writeFileSync('users.json', JSON.stringify(userPrefs, null, 2))
    }

    const iconPref = userPrefs[userId]['iconset']
    let diffSetName
    switch (iconPref) {
        case 'saph':
            diffSetName = 'pguDiffSaph'
            break
        case 'default':
        default:
            diffSetName = 'pguDiff'
    }
    return emojiData[diffSetName]
}

export default {
    createLevelEmbed,
    createLevelButtons,
    createSearchSelectList,
    getTUFApi,
    getDiffSet
}
