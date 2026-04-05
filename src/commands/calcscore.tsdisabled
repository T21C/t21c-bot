import {
    SlashCommandBuilder,
    EmbedBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    HexColorString
} from 'discord.js'
import { pguDiffColors, emojis } from '../info.json'
import { calculatePP } from '../utils/score'
import { ChatInputCommandInteraction } from 'discord.js'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calcscore')
        .setDescription('Calculates the score of a play')
        .addStringOption((option) =>
            option
                .setName('diff')
                .setDescription('The difficulty of the level (ex: U1)')
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

        let diff = interaction.options.getString('diff', true)
        const xacc = interaction.options.getNumber('xacc', true)
        const tileCount = interaction.options.getNumber('tilecount')
        const misses = interaction.options.getNumber('misses', true)
        let speed = interaction.options.getNumber('speed') || 1

        if (misses > 0 && xacc === 100) {
            return interaction.editReply('misses and xacc mismatch')
        }

        let scoreBase
        if (!isNaN(+diff)) scoreBase = +diff
        else {
            switch (diff) {
                case 'P1':
                    scoreBase = 0.05
                    break
                case 'P2':
                    scoreBase = 0.1
                    break
                case 'P3':
                    scoreBase = 0.2
                    break
                case 'P4':
                    scoreBase = 0.3
                    break
                case 'P5':
                    scoreBase = 0.4
                    break
                case 'P6':
                    scoreBase = 0.5
                    break
                case 'P7':
                    scoreBase = 0.6
                    break
                case 'P8':
                    scoreBase = 0.7
                    break
                case 'P9':
                    scoreBase = 0.8
                    break
                case 'P10':
                    scoreBase = 0.9
                    break
                case 'P11':
                    scoreBase = 1
                    break
                case 'P12':
                    scoreBase = 2
                    break
                case 'P13':
                    scoreBase = 3
                    break
                case 'P14':
                    scoreBase = 4
                    break
                case 'P15':
                    scoreBase = 10
                    break
                case 'P16':
                    scoreBase = 15
                    break
                case 'P17':
                    scoreBase = 20
                    break
                case 'P18':
                    scoreBase = 30
                    break
                case 'P19':
                    scoreBase = 45
                    break
                case 'P20':
                    scoreBase = 60
                    break
                case 'G1':
                    scoreBase = 100
                    break
                case 'G2':
                    scoreBase = 110
                    break
                case 'G3':
                    scoreBase = 120
                    break
                case 'G4':
                    scoreBase = 130
                    break
                case 'G5':
                    scoreBase = 140
                    break
                case 'G6':
                    scoreBase = 150
                    break
                case 'G7':
                    scoreBase = 160
                    break
                case 'G8':
                    scoreBase = 170
                    break
                case 'G9':
                    scoreBase = 180
                    break
                case 'G10':
                    scoreBase = 190
                    break
                case 'G11':
                    scoreBase = 200
                    break
                case 'G12':
                    scoreBase = 210
                    break
                case 'G13':
                    scoreBase = 220
                    break
                case 'G14':
                    scoreBase = 230
                    break
                case 'G15':
                    scoreBase = 240
                    break
                case 'G16':
                    scoreBase = 250
                    break
                case 'G17':
                    scoreBase = 275
                    break
                case 'G18':
                    scoreBase = 300
                    break
                case 'G19':
                    scoreBase = 350
                    break
                case 'G20':
                    scoreBase = 400
                    break
                case 'U1':
                    scoreBase = 500
                    break
                case 'U2':
                    scoreBase = 600
                    break
                case 'U3':
                    scoreBase = 700
                    break
                case 'U4':
                    scoreBase = 850
                    break
                case 'U5':
                    scoreBase = 1000
                    break
                case 'U6':
                    scoreBase = 1300
                    break
                case 'U7':
                    scoreBase = 1600
                    break
                case 'U8':
                    scoreBase = 1800
                    break
                case 'U9':
                    scoreBase = 2000
                    break
                case 'U10':
                    scoreBase = 2500
                    break
                case 'U11':
                    scoreBase = 3000
                    break
                case 'U12':
                    scoreBase = 4000
                    break
                case 'U13':
                    scoreBase = 5000
                    break
                default:
                    return interaction.editReply(
                        'Invalid string or number specified for diff.'
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
            .setColor(pguDiffColors[diff] as HexColorString)
            .setTitle(`Score: ${score}`)
            .setDescription(`Difficulty: ${interaction.client.emojis.cache.get(emojis['pguDiff'][diff])?.toString()}
            X-Accuracy: ${xacc}%
            Tile Count: ${tileCount}
            Speed Trial: x${speed}
            Misses: ${misses}`)

        await interaction.editReply({ embeds: [embed] })
    }
}
