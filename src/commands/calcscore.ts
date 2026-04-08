import {
    SlashCommandBuilder,
    EmbedBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    HexColorString
} from 'discord.js'
import { calculatePP } from '../utils/score'
import { ChatInputCommandInteraction } from 'discord.js'
import * as fs from 'node:fs'

interface DifficultyData {
    id: number
    name: string
    type: string
    icon: string
    emoji: string
    color: string
    createdAt: string
    updatedAt: string
    baseScore: number
    sortOrder: 1
    legacy: string
    legacyIcon: string | null
    legacyEmoji: string | null
}

interface DifficultyFile {
    difficulty: DifficultyData[]
    hash: string
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calcscore')
        .setDescription('Calculates the score of a play')
        .addStringOption((option) =>
            option
                .setName('diff')
                .setDescription(
                    'The difficulty of the level, or a custom base score'
                )
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName('xacc')
                .setDescription('The X-Accuracy of the pass (ex: 99.99)')
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName('tilecount')
                .setDescription('Number of tiles of the level')
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName('misses')
                .setDescription('Number of misses (Too Earlys)')
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName('speed')
                .setDescription('The speed of the pass (ex: 1.1)')
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

        const diffData = JSON.parse(
            fs.readFileSync('difficulty.json', 'utf8')
        ) as DifficultyFile

        let diff = interaction.options.getString('diff', true)
        const xacc = interaction.options.getNumber('xacc', true)
        const tileCount = interaction.options.getNumber('tilecount')
        const misses = interaction.options.getNumber('misses', true)
        let speed = interaction.options.getNumber('speed') || 1

        if (misses > 0 && xacc === 100) {
            return interaction.editReply('misses and xacc mismatch')
        }

        let scoreBase, diffSearch
        if (!isNaN(+diff)) {
            scoreBase = +diff
            if (scoreBase < 0) {
                return interaction.editReply('base score 0 or less')
            }
        } else {
            const diffSearch = diffData.difficulty.find((d) =>
                d.name.includes(diff)
            )
            if (!diffSearch) {
                return interaction.editReply('no diff found')
            }

            scoreBase = diffSearch.baseScore

            if (scoreBase === 0) {
                return interaction.editReply(
                    `diff ${diffSearch.name} has base score 0`
                )
            }
        }

        const score = calculatePP(
            xacc,
            speed,
            scoreBase,
            false,
            tileCount,
            misses,
            false
        )

        const embed = new EmbedBuilder()
            .setColor(
                diffSearch ? (diffSearch.color as HexColorString) : '#341c4c'
            )
            .setTitle(`Score: ${score}`)
            .setDescription(`${diffSearch ? `Difficulty: ${diffSearch.emoji} (base score ${scoreBase})` : `Base Score: ${scoreBase}`}
            X-Accuracy: ${xacc}%
            Tile Count: ${tileCount}
            Speed Trial: x${speed}
            Misses: ${misses}`)

        await interaction.editReply({ embeds: [embed] })
    }
}
